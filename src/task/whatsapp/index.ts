import makeWASocket, {
  DisconnectReason,
  UserFacingSocketConfig,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

const SESSIONS_PATH = path.join(process.cwd(), 'sessions');

/**
 * 
export enum CALLBACK_KEY {
  ON_MESSAGE_RECEIVED = "on-message-received",
  ON_QR = "on-qr",
  ON_CONNECTED = "on-connected",
  ON_DISCONNECTED = "on-disconnected",
  ON_CONNECTING = "on-connecting",
}
 */

export default class WhatsApp {
  private sock: any;

  constructor(private sessionId: string) {}

  async getSock() {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve(SESSIONS_PATH, this.sessionId),
    );

    this.sock = makeWASocket({
      version: [2, 2329, 9],
      defaultQueryTimeoutMs: undefined,
      printQRInTerminal: true,
      keepAliveIntervalMs: 15000,
      markOnlineOnConnect: true,
      mobile: false,
      syncFullHistory: false,
      auth: state,
    } as UserFacingSocketConfig);
  }

  async init() {
    await this.getSock();

    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          'connection closed due to ',
          lastDisconnect.error,
          ', reconnecting ',
          shouldReconnect,
        );
        // reconnect if not logged out
        if (shouldReconnect) {
          this.init();
        }
      } else if (connection === 'open') {
        console.log('opened connection');
      }
    });
    this.sock.ev.on('messages.upsert', async (m) => {
      console.log(JSON.stringify(m, undefined, 2));

      console.log('replying to', m.messages[0].key.remoteJid);
      await this.sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: 'Hello there!',
      });
    });
  }

  async connectionUpdate() {}
  async messagesUpsert() {}
  async onQRUpdated() {}
  async onDisconnected() {}
  async onCredentialsUpdated() {}
}
