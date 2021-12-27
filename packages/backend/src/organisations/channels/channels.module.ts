import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { OrganisationsService } from "../organisations.service";
import { B2Module } from "@/b2/b2.module";

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService, OrganisationsService],
  imports: [PrismaModule, B2Module]
})
export class ChannelsModule {}
