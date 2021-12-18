import { PrismaModule } from "@/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { InvitesService } from "./invites.service";

@Module({
  exports: [InvitesService],
  providers: [InvitesService],
  imports: [PrismaModule]
})
export class InvitesModule {}
