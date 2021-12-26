import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { OrganisationsService } from "../organisations.service";
import { IsLoggedIn } from "@/auth/auth.guard";
import { GetUser } from "@/auth/user.decorator";
import { MaxLength, MinLength, IsOptional } from "class-validator";
import { httpError } from "@/util";
import { User } from "@prisma/client";
import { hashSync, genSaltSync } from "bcryptjs";

class CreateChannelBody {
  @MaxLength(64)
  @MinLength(4)
  name: string;

  @IsOptional()
  @MaxLength(256)
  description?: string;

  @IsOptional()
  is_encrypted?: boolean;

  @IsOptional()
  password?: string;
}

@Controller("/organisations/:orgId/channels")
export class ChannelsController {
  constructor(
    private channels: ChannelsService,
    private organisations: OrganisationsService
  ) {}

  @Get()
  @UseGuards(IsLoggedIn)
  async getAllChannels(@Param("orgId") orgId: string, @GetUser() user: any) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    return { channels: await this.channels.getAllChannels(orgId) };
  }

  @Get(":channelId")
  @UseGuards(IsLoggedIn)
  async getChannel(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @GetUser() user: any
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    return await this.channels.getChannel(channelId, orgId);
  }

  @Post()
  @UseGuards(IsLoggedIn)
  async createChannel(
    @Param("orgId") orgId: string,
    @Body() body: CreateChannelBody,
    @GetUser() user: any
  ) {
    if (body.is_encrypted && !body.password) {
      return httpError(400, "Password is required when channel is encrypted");
    }

    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    return await this.channels.db.chatChannels.create({
      data: {
        name: body.name,
        description: body.description,
        is_encrypted: body.is_encrypted || false,
        password: body.password,
        owner: {
          connect: {
            id: user.id
          }
        },
        organisation: {
          connect: {
            id: orgId
          }
        }
      },
      include: {
        owner: true
      }
    });
  }

  @Put(":channelId")
  @UseGuards(IsLoggedIn)
  async updateChannel(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @Body() body: CreateChannelBody,
    @GetUser() user: User
  ) {
    console.log(body.is_encrypted, body);
    if (body.is_encrypted && !body.password) {
      return httpError(400, "Password is required when channel is encrypted");
    }

    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    const channel = await this.channels.getChannel(channelId, orgId);

    if (!channel) {
      return httpError(404, "Channel not found");
    }

    if (channel.owner_id !== user.id && org.owner_id !== user.id) {
      return httpError(403, "You are not the owner of this channel");
    }

    if (body.name) channel.name = body.name;
    if (body.description) channel.description = body.description;
    if (body.is_encrypted !== undefined) channel.is_encrypted = body.is_encrypted;
    if (body.password) channel.password = hashSync(body.password, genSaltSync(12));

    return await this.channels.db.chatChannels.update({
      where: {
        id: channelId
      },
      data: {
        name: channel.name,
        description: channel.description,
        is_encrypted: channel.is_encrypted,
        password: channel.password
      },
      include: {
        owner: true
      }
    });
  }

  @Delete(":channelId")
  @UseGuards(IsLoggedIn)
  async deleteChannel(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @GetUser() user: User
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    const channel = await this.channels.getChannel(channelId, orgId);

    if (!channel) {
      return httpError(404, "Channel not found");
    }

    if (channel.owner_id !== user.id && org.owner_id !== user.id) {
      return httpError(403, "You are not the owner of this channel");
    }

    return await this.channels.db.chatChannels.delete({
      where: {
        id: channelId
      }
    });
  }
}
