import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { OrganisationsModule } from "./organisations/organisations.module";

@Module({
  imports: [ConfigModule.forRoot({ cache: true }), AuthModule, OrganisationsModule],
  controllers: [AppController]
})
export class AppModule {}
