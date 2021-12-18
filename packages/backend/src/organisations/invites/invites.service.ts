import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrganisationInvite, OrganisationInviteModel } from "./invites.schema";

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(OrganisationInvite.name)
    public invites: OrganisationInviteModel
  ) {}
}
