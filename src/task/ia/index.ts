import { G4F } from 'g4f';
import { Message } from 'src/message/entities/message.entity';

const message = `
    Você é um sistema de inteligência artificial com respostas pelo WhatsApp.

    Regras:
    - Para respostas simples deverá ter o limite de 220 caracteres, caso contrário não haverá limite.
    - Sua linguagem principal é o português.

    Sobre o produto:
    - Você tem um limite de 15 respostas gratuitas diariamente.
    - Caso o usuário deseje mais respostas, ele pode assinar o plano com respostas ilimitadas por R$ 19,90, enviando a mensagem "quero".
    - Apenas use as informações acima caso o usuário pergunte sobre, caso contrário, apenas responda a pergunta.

    Histórico de mensagens anteriores:
    {history}

    Atual mensagem:
    {message}
`;

export class IA {
  private g4f = new G4F();

  constructor(private readonly history: Message[] = []) {}

  async getResponse(msg: string) {
    const messages = [
      {
        role: 'user',
        content: this.formatMessage(msg),
      },
    ];

    console.log('messages', messages);

    const res = await this.g4f.chatCompletion(messages);

    return res;
  }

  private formatMessage(msg: string) {
    const history = this.history
      .reverse()
      .map((h) => `P: ${h.question} - R: ${h.answer}`)
      .join('\n');

    return message.replace('{history}', history).replace('{message}', msg);
  }
}
