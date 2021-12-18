import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrganisationsController } from "./organisations.controller";
import { OrganisationsService } from "./organisations.service";
import { Organisation, OrganisationSchema } from "./organisations.schema";
import { UsersModule } from "@/auth/users/users.module";
import { InvitesModule } from "./invites/invites.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organisation.name, schema: OrganisationSchema }
    ]),
    UsersModule,
    InvitesModule
  ],
  exports: [
    MongooseModule.forFeature([{ name: Organisation.name, schema: OrganisationSchema }])
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService]
})
export class OrganisationsModule {}
