import { Module } from "@nestjs/common";
import { InvitesService } from "./invites.service";
import { MongooseModule } from "@nestjs/mongoose";
import { OrganisationInvite, OrganisationInviteSchema } from "./invites.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganisationInvite.name, schema: OrganisationInviteSchema }
    ])
  ],
  exports: [
    MongooseModule.forFeature([
      { name: OrganisationInvite.name, schema: OrganisationInviteSchema }
    ]),
    InvitesService
  ],
  providers: [InvitesService]
})
export class InvitesModule {}
