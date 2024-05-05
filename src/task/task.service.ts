import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as whatsapp from 'wa-sockets';
var qr_image = require('qr-image');
import * as fs from 'fs';
import * as path from 'path';
import stripe, { Stripe } from 'stripe';
import whisper from 'nodejs-whisper';
import { IA } from './ia';
import { UserService } from 'src/user/user.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import WhatsApp from './whatsapp';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  constructor(
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly messageService: MessageService,
  ) {}

  async onModuleInit() {
    await this.messagesHandler();
  }

  private async initSession() {
    await whatsapp.startSession('main');

    whatsapp.loadSessionsFromStorage();
  }

  @Cron('0 0 0 * * *', { name: 'resetUsage' })
  async resetUsage() {
    await this.userService.update({}, { usage: 0 });
  }

  @Cron('0 0 0 * * *', { name: 'resetMessages' })
  async resetMessages() {
    await this.subscriptionService.remove({});
  }

  async messagesHandler() {
    await this.initSession();

    whatsapp.onQRUpdated(({ sessionId, qr }) => {
      const qr_png = qr_image.image(qr, { type: 'png' });
      qr_png.pipe(
        fs.createWriteStream(path.join(process.cwd(), `qr-${sessionId}.png`)),
      );
    });

    whatsapp.onConnected(() => {
      this.logger.log('WhatsApp connected');
    });

    whatsapp.onDisconnected(() => {
      this.initSession();
    });

    whatsapp.onMessageReceived(this.onMessage.bind(this));
  }

  private async onMessage(msg: whatsapp.MessageReceived) {
    const jid = msg.key.remoteJid;
    const message =
      msg.message?.extendedTextMessage?.text || msg.message?.conversation;

    const interruptVerification =
      msg.key.fromMe || msg.key.remoteJid.includes('status') || !message;

    if (interruptVerification) {
      return;
    }

    whatsapp.sendTyping({
      sessionId: msg.sessionId,
      to: jid,
      duration: 3000,
    });

    const user = await this.userService.findOne({
      where: { jid: jid },
      relations: {
        subscription: true,
      },
    });

    const messages = await this.messageService.findAll({
      where: {
        user: {
          jid: jid,
        },
      },
      take: 3,
      order: {
        createdAt: 'DESC',
      },
    });

    if (!user) {
      await whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: jid,
        text: `Olá, tudo bem? Sou um sistema de inteligência artificial com respostas pelo WhatsApp. Atualmente você tem gratuitamente *15 respostas* gratuitas diariamente 🙂\n\nTemos também um plano com *respostas ilimitadas* por apenas R$ 19,90. Caso tenha interesse, digite "quero" para mais informações.`,
        answering: msg,
      });

      await this.userService.create({ jid: jid, usage: 0 });

      return;
    }

    const subscribeList = ['quero', 'quero sim', 'sim', 'quero sim!'];
    const wantsToSubscribe = subscribeList.includes(message.toLowerCase());

    if (wantsToSubscribe) {
      const checkout = await this.createCheckoutSession(jid);

      await whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: jid,
        text: `Para assinar o plano com *respostas ilimitadas* por apenas R$ 19,90, acesse o link: *${checkout.url}*`,
        answering: msg,
      });

      return;
    }

    const hasSubscription = user.subscription;
    const limitWasExceeded = user.usage >= 15;

    if (limitWasExceeded && !hasSubscription) {
      const checkout = await this.createCheckoutSession(jid);

      await whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: jid,
        text: `Você atingiu o limite de respostas gratuitas diárias, apartir da meia-noite você terá mais *15 respostas* disponíveis. \n\nSinta-se a vontade para assinar o plano com *respostas ilimitadas* por apenas R$ 19,90. Acesse o link: *${checkout.url}*`,
        answering: msg,
      });

      return;
    }

    const ia = new IA(messages);

    const response = await ia.getResponse(message);

    await whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: jid,
      text: response,
      answering: msg,
    });

    await this.messageService.create({
      question: message,
      answer: response,
      user: user,
    });

    await this.userService.update({ jid: jid }, { usage: user.usage + 1 });
  }

  private async createCheckoutSession(jid: string) {
    const session = await this.stripe.checkout.sessions.create({
      success_url: 'http://localhost:8000/api/v1/subscription/webhook',
      cancel_url: 'http://localhost:8000/api/v1/subscription/webhook',
      client_reference_id: jid,
      payment_method_types: ['card', 'boleto'],

      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Plano com respostas ilimitadas',
            },
            unit_amount: 1990,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });

    return session;
  }
}
