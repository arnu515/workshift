import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ChannelsService {
  constructor(public db: PrismaService) {}

  getAllChannels(orgId: string) {
    return this.db.chatChannels.findMany({
      where: {
        organisation_id: orgId
      },
      include: {
        owner: true
      }
    });
  }

  getChannel(channelId: string, orgId?: string) {
    if (!orgId)
      return this.db.chatChannels.findFirst({
        where: {
          id: channelId
        },
        include: {
          owner: true
        }
      });
    return this.db.chatChannels.findFirst({
      where: {
        id: channelId,
        organisation_id: orgId
      },
      include: {
        owner: true
      }
    });
  }

  async getMessages(channelId: string, skip = 0, take = 100) {
    const channel = await this.getChannel(channelId);
    if (!channel) return null;

    return this.db.chatMessages.findMany({
      skip,
      take,
      orderBy: {
        created_at: "desc"
      },
      include: {
        user: true
      },
      where: {
        channel_id: channelId
      }
    });
  }
}
