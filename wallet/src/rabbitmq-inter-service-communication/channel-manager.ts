import { connect, Channel } from 'amqplib';
import config from 'src/config';

export class ChannelManager {
  private channel: Promise<Channel>;

  constructor() {
    this.channel = this.createChannel();
  }

  private async createChannel(): Promise<Channel> {
    const { host, port } = config.rabbitMq;
    const connection = await connect(`amqp://${host}:${port}`);
    const channel = await connection.createChannel();
    return channel;
  }

  async getChannel() {
    return this.channel;
  }
}
