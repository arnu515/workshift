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
}
