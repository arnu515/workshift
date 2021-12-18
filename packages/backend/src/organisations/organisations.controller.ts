import { Controller, Get, Param, Post, Body, UseGuards, Session } from "@nestjs/common";
import { CreateOrganisationBody, OrganisationsService } from "./organisations.service";
import { IsNotEmpty, IsMongoId, isMongoId } from "class-validator";
import { IsLoggedIn } from "../auth/auth.guard";
import { InvitesService } from "./invites/invites.service";
import { httpError } from "@/util";
import { PrismaService } from "@/prisma/prisma.service";

class InviteToOrganisationBody {
  @IsMongoId({ message: "Invalid user ID" })
  @IsNotEmpty()
  userId: string;
}

@Controller("organisations")
export class OrganisationsController {
  constructor(
    private db: PrismaService,
    private organisationsService: OrganisationsService,
    private invitesService: InvitesService
  ) {}

  @Get("/invites")
  @UseGuards(IsLoggedIn)
  async getUserInvites(@Session() session: Record<any, any>) {
    console.log(session.user);
    return await this.invitesService.getUserInvites(session.user.id);
  }

  @Get(":id")
  async getOrgById(@Param("id") id: string) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    return org;
  }

  @Post("/")
  @UseGuards(IsLoggedIn)
  async createOrganisation(
    @Body() body: CreateOrganisationBody,
    @Session() session: Record<any, any>
  ) {
    const org = await this.organisationsService.createOrganisation(body, session.user);

    if (typeof org === "string") {
      return httpError(400, org);
    }

    return org;
  }

  @Post("/:id/invite")
  @UseGuards(IsLoggedIn)
  async inviteToOrganisation(
    @Body() body: InviteToOrganisationBody,
    @Session() session: Record<any, any>,
    @Param("id") id: string
  ) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner.toString() !== session.user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    const invitedUser = await this.db.user.findFirst({ where: { id: body.userId } });

    if (!invitedUser) {
      return httpError(404, "User not found");
    }

    if (invitedUser.id.toString() === session.user.id.toString()) {
      return httpError(400, "You can't invite yourself to an organisation");
    }

    if (invitedUser.id.toString() === org.owner.toString()) {
      return httpError(400, "This user is the owner of this organisation");
    }

    const invitedUsersOrgs = await this.organisationsService.getUserOrgs(body.userId);

    if (!invitedUser) {
      return httpError(404, "User not found");
    }

    if (invitedUser.id.toString() === session.user.id.toString()) {
      return httpError(400, "You can't invite yourself");
    }

    if (invitedUsersOrgs.some((org: any) => org.toString() === id)) {
      return httpError(400, "User is already a member of this organisation");
    }

    let invite = await this.invitesService.invites.findFirst({
      where: {
        organisation_id: org.id,
        user_id: invitedUser.id
      }
    });

    if (invite) {
      return httpError(400, "User has already been invited to this organisation");
    }

    invite = await this.invitesService.invites.create({
      data: {
        organisation_id: org.id,
        user_id: invitedUser.id
      }
    });

    return { org, invite };
  }

  @Post("/:id/invites")
  @UseGuards(IsLoggedIn)
  async getOrgInvites(@Param("id") id: string, @Session() session: Record<any, any>) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner.toString() !== session.user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    return await this.invitesService.getOrgInvites(id);
  }
}
