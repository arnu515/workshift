import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query
} from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { OrganisationsService } from "../organisations.service";
import { IsLoggedIn } from "@/auth/auth.guard";
import { GetUser } from "@/auth/user.decorator";
import { MaxLength, MinLength, IsOptional } from "class-validator";
import { httpError } from "@/util";
import { User } from "@prisma/client";
import sanitize from "sanitize-html";
import { marked } from "marked";

class CreateChannelBody {
  @MaxLength(64)
  @MinLength(4)
  name: string;

  @IsOptional()
  @MaxLength(256)
  description?: string;
}

@Controller("/organisations/:orgId/channels")
export class ChannelsController {
  constructor(
    private channels: ChannelsService,
    private organisations: OrganisationsService
  ) {}

  @Get()
  @UseGuards(IsLoggedIn)
  async getAllChannels(@Param("orgId") orgId: string, @GetUser() user: User) {
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
    @GetUser() user: User
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
    @GetUser() user: User
  ) {
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

    return await this.channels.db.chatChannels.update({
      where: {
        id: channelId
      },
      data: {
        name: channel.name,
        description: channel.description
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

  @Get(":channelId/messages")
  @UseGuards(IsLoggedIn)
  async getMessages(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @GetUser() user: User,
    @Query("skip") skip?: number,
    @Query("take") take?: number
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    if (!skip) skip = 0;
    if (!take) take = 100;
    const messages = await this.channels.getMessages(channelId, skip, take);
    if (!messages) {
      return httpError(404, "Channel not found");
    }
    return { messages };
  }

  @Post(":channelId/messages/text")
  @UseGuards(IsLoggedIn)
  async createTextMessage(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @Body("text") text: string,
    @GetUser() user: User
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    const channel = await this.channels.getChannel(channelId);
    if (!channel) {
      return httpError(404, "Channel not found");
    }

    text = text?.trim();
    if (!text || typeof text !== "string") {
      return httpError(400, "Message text is required");
    }
    if (text.length > 2048) {
      return httpError(400, "A message cannot be longer than 2048 characters");
    }

    text = sanitize(marked(text), {
      allowedTags: [
        "a",
        "p",
        "b",
        "i",
        "strong",
        "em",
        "del",
        "ins",
        "br",
        "sup",
        "sub",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "span",
        "small",
        "mark",
        "kbd",
        "ul",
        "ol",
        "li"
      ],
      allowedAttributes: {
        a: ["href", "target"],
        p: ["style", "class"],
        span: ["style", "class"]
      }
    })
      .trim()
      .replace(/\n/g, "<br>");

    return await this.channels.db.chatMessages.create({
      data: {
        user: { connect: { id: user.id } },
        type: "text",
        content: text,
        channel: { connect: { id: channelId } }
      }
    });
  }

  @Put(":channelId/messages/text/:messageId")
  @UseGuards(IsLoggedIn)
  async updateTextMessage(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @Param("messageId") messageId: string,
    @Body("text") text: string,
    @GetUser() user: User
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    const channel = await this.channels.getChannel(channelId);
    if (!channel) {
      return httpError(404, "Channel not found");
    }

    const message = await this.channels.db.chatMessages.findFirst({
      where: {
        id: messageId
      }
    });
    if (!message) {
      return httpError(404, "Message not found");
    }

    if (message.user_id !== user.id) {
      return httpError(403, "You are not the owner of this message");
    }

    if (message.type !== "text") {
      return httpError(400, "This message is not a text message");
    }

    text = text?.trim();
    if (!text || typeof text !== "string") {
      return httpError(400, "Message text is required");
    }
    if (text.length > 2048) {
      return httpError(400, "A message cannot be longer than 2048 characters");
    }

    text = sanitize(marked(text), {
      allowedTags: [
        "a",
        "p",
        "b",
        "i",
        "strong",
        "em",
        "del",
        "ins",
        "br",
        "sup",
        "sub",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "span",
        "small",
        "mark",
        "kbd",
        "ul",
        "ol",
        "li"
      ],
      allowedAttributes: {
        a: ["href", "target"],
        p: ["style", "class"],
        span: ["style", "class"]
      }
    })
      .trim()
      .replace(/\n/g, "<br>");

    return await this.channels.db.chatMessages.update({
      data: {
        content: text
      },
      where: {
        id: messageId
      }
    });
  }

  @Delete(":channelId/messages/text/:messageId")
  @UseGuards(IsLoggedIn)
  async deleteTextMessage(
    @Param("orgId") orgId: string,
    @Param("channelId") channelId: string,
    @Param("messageId") messageId: string,
    @GetUser() user: User
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    const channel = await this.channels.getChannel(channelId);
    if (!channel) {
      return httpError(404, "Channel not found");
    }

    const message = await this.channels.db.chatMessages.findFirst({
      where: {
        id: messageId
      }
    });
    if (!message) {
      return httpError(404, "Message not found");
    }

    if (message.user_id !== user.id) {
      return httpError(403, "You are not the owner of this message");
    }

    return await this.channels.db.chatMessages.delete({
      where: {
        id: messageId
      }
    });
  }
}
