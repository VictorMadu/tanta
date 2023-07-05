import { Injectable } from '@nestjs/common';
import config from 'src/config';
import { ChannelManager } from './channel-manager';
import * as uuid from 'uuid';

@Injectable()
export class MessagingService {
  private channelManager = new ChannelManager();
  private exchangeName = config.rabbitMq.exchangeName;

  constructor() {}

  async publishWithNoResponse(routingKey: string, payload: object) {
    const channel = await this.channelManager.getChannel();

    await channel.assertExchange(this.exchangeName, 'direct', {
      durable: false,
    });
    const { queue } = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(queue, this.exchangeName, routingKey);

    channel.publish(
      this.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
    );
  }

  async publishWithDirectResponse<T = object>(
    routingKey: string,
    payload: object,
    timeOutInMs = 3000,
  ) {
    const channel = await this.channelManager.getChannel();

    await channel.assertExchange(this.exchangeName, 'direct', {
      durable: false,
    });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    const correlationId = uuid.v4();

    await channel.bindQueue(queue, this.exchangeName, routingKey);

    const pendingResponse = new Promise<T>((resolve, reject) => {
      channel.consume(
        queue,
        (message) => {
          if (message == null) return;
          if (message.properties.correlationId === correlationId) {
            resolve(JSON.parse(message.content.toString()) as T);
          }
        },
        { noAck: true },
      );

      setTimeout(reject, timeOutInMs);
    });

    channel.publish(
      this.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
    );

    return pendingResponse;
  }
}
