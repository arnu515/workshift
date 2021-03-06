import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Patch,
  Put,
  Delete
} from "@nestjs/common";
import {
  CreateOrganisationBody,
  OrganisationsService,
  UpdateOrganisationBody
} from "./organisations.service";
import { IsNotEmpty, IsMongoId, isMongoId } from "class-validator";
import { IsLoggedIn } from "../auth/auth.guard";
import { InvitesService } from "./invites/invites.service";
import { httpError } from "@/util";
import { PrismaService } from "@/prisma/prisma.service";
import { GetUser } from "@/auth/user.decorator";
import type { User } from "@prisma/client";

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
  async getUserInvites(@GetUser() user: User) {
    return { invites: await this.invitesService.getUserInvites(user.id) };
  }

  @Get("/")
  @UseGuards(IsLoggedIn)
  async getJoinedOrgs(@GetUser() user: User) {
    return {
      organisations: await this.organisationsService.getJoinedOrgs(user.id)
    };
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

  @Get(":id/members")
  async getOrgMembers(@Param("id") id: string) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }
    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    return await this.organisationsService.getOrgWithMembers(org.id);
  }

  @Delete(":id/members/:memberId")
  @UseGuards(IsLoggedIn)
  async removeMemberFromOrg(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @GetUser() user: User
  ) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }
    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner_id !== user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    if (user.id.toString() === memberId) {
      return httpError(400, "You can't remove yourself from an organisation");
    }

    const res = await this.organisationsService.removeMemberFromOrg(memberId, org.id);

    if (typeof res === "string") {
      return httpError(400, res);
    }

    return res;
  }

  @Post("/")
  @UseGuards(IsLoggedIn)
  async createOrganisation(
    @Body() body: CreateOrganisationBody,
    @GetUser() user: User
  ) {
    const org = await this.organisationsService.createOrganisation(body, user);

    if (typeof org === "string") {
      return httpError(400, org);
    }

    return org;
  }

  @Put("/:id")
  @UseGuards(IsLoggedIn)
  async updateOrganisation(
    @Param("id") orgId: string,
    @Body() body: UpdateOrganisationBody,
    @GetUser() user: User
  ) {
    if (!isMongoId(orgId)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner_id !== user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    const updatedOrg = await this.organisationsService.updateOrganisation(orgId, body);

    if (typeof updatedOrg === "string") {
      return httpError(400, updatedOrg);
    }

    return updatedOrg;
  }

  @Delete("/:id")
  @UseGuards(IsLoggedIn)
  async deleteOrganisation(@Param("id") orgId: string, @GetUser() user: User) {
    if (!isMongoId(orgId)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner_id !== user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    return await this.organisationsService.deleteOrganisation(orgId);
  }

  @Post("/:id/invites")
  @UseGuards(IsLoggedIn)
  async inviteToOrganisation(
    @Body() body: InviteToOrganisationBody,
    @GetUser() user: User,
    @Param("id") id: string
  ) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner_id.toString() !== user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    const invitedUser = await this.db.user.findFirst({ where: { id: body.userId } });

    if (!invitedUser) {
      return httpError(404, "User not found");
    }

    if (invitedUser.id.toString() === user.id.toString()) {
      return httpError(400, "You can't invite yourself to an organisation");
    }

    if (invitedUser.id.toString() === org.owner.toString()) {
      return httpError(400, "This user is the owner of this organisation");
    }

    const invitedUsersOrgs = await this.organisationsService.getJoinedOrgs(
      invitedUser.id
    );

    if (!invitedUser) {
      return httpError(404, "User not found");
    }

    if (invitedUser.id.toString() === user.id.toString()) {
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

  @Get("/:id/invites")
  @UseGuards(IsLoggedIn)
  async getOrgInvites(@Param("id") id: string, @GetUser() user: User) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner_id !== user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    return { invites: await this.invitesService.getOrgInvites(id) };
  }

  @Delete("/:id/invites/:inviteId")
  @UseGuards(IsLoggedIn)
  async cancelInvite(
    @Param("id") id: string,
    @Param("inviteId") inviteId: string,
    @GetUser() user: User
  ) {
    if (!isMongoId(id)) {
      return httpError(400, "Invalid ID");
    }

    const org = await this.organisationsService.getOrgById(id);

    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner_id !== user.id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    const invite = await this.invitesService.invites.findFirst({
      where: {
        id: inviteId
      }
    });

    if (!invite) {
      return httpError(404, "Invite not found");
    }

    await this.invitesService.invites.delete({ where: { id: invite.id } });

    return { org, invite };
  }

  @Patch("/:id/invites/:inviteId")
  @UseGuards(IsLoggedIn)
  async acceptOrDeclineInvite(
    @Body("action") action: string,
    @Param("id") id: string,
    @Param("inviteId") inviteId: string,
    @GetUser() user: User
  ) {
    if (!["accept", "decline"].includes(action)) {
      return httpError(400, "Invalid action");
    }

    const invite = await this.invitesService.invites.findFirst({
      where: {
        id: inviteId
      }
    });

    if (!invite) {
      return httpError(404, "Invite not found");
    }

    if (invite.organisation_id.toString() !== id) {
      return httpError(400, "This invite does not belong to this organisation");
    }

    if (invite.user_id !== user.id.toString()) {
      return httpError(403, "This invite does not belong to you");
    }

    if (action === "accept") {
      const org = await this.organisationsService.addUserToOrg(invite.user_id, id);
      if (typeof org === "string") {
        return httpError(400, org);
      }
    }

    await this.invitesService.invites.delete({ where: { id: invite.id } });

    return { message: `Invite ${action === "accept" ? "accepted" : "declined"}` };
  }
}
