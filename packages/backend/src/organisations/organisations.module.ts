import { Module } from "@nestjs/common";
import { OrganisationsController } from "./organisations.controller";
import { OrganisationsService } from "./organisations.service";
import { InvitesModule } from "./invites/invites.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { ChannelsModule } from "./channels/channels.module";

@Module({
  imports: [InvitesModule, PrismaModule, ChannelsModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService]
})
export class OrganisationsModule {}
