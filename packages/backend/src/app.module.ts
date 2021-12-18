import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { OrganisationsModule } from "./organisations/organisations.module";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [ConfigModule.forRoot({ cache: true }), AuthModule, OrganisationsModule],
  controllers: [AppController],
  providers: [PrismaService]
})
export class AppModule {}
