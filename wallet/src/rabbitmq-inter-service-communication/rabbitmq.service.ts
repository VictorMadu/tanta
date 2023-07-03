import { Injectable } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import { v4 as uuid } from 'uuid';
import { ChannelManager } from './channel-manager';

@Injectable()
export class RabbitMQService {
  private channelManager = new ChannelManager();

  constructor() {}

  async publishNotifyUser(payload: any): Promise<any> {
    const correlationId = uuid();

    const channel = await this.channelManager.getChannel();
    const replyQueue = await channel.assertQueue('', { exclusive: true });

    const consumePromise = new Promise<any>((resolve, reject) => {
      channel.consume(
        replyQueue.queue,
        (msg) => {
          if (msg == null) return;

          if (msg.properties.correlationId === correlationId) {
            resolve(JSON.parse(msg.content.toString()));
            channel.deleteQueue(replyQueue.queue);
          }
        },
        { noAck: true },
      );
    });

    const messageBuffer = Buffer.from(JSON.stringify(payload));

    await channel.sendToQueue('user_management_queue', messageBuffer, {
      correlationId,
      replyTo: replyQueue.queue,
    });

    const response = await consumePromise;
    return response;
  }
}
