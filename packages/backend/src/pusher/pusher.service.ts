import { Injectable } from "@nestjs/common";
import Pusher from "pusher";

@Injectable()
export class PusherService extends Pusher {
  constructor() {
    super({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_APP_KEY!,
      secret: process.env.PUSHER_APP_SECRET!,
      cluster: process.env.PUSHER_APP_CLUSTER!,
      useTLS: true
    });
  }
}
