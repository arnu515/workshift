import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ChannelsService } from "./channels.service";
import { OrganisationsService } from "../organisations.service";
import { IsLoggedIn } from "@/auth/auth.guard";
import { GetUser } from "@/auth/user.decorator";
import { MaxLength, MinLength, IsOptional } from "class-validator";
import { httpError } from "@/util";
import { User } from "@prisma/client";
import sanitize from "sanitize-html";
import { B2Service } from "@/b2/b2.service";
import { marked } from "marked";
import slugify from "slugify";
import nanoid from "nanoid";
import type { Express } from "express";

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
    private organisations: OrganisationsService,
    private b2: B2Service
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
    @Query("skip") skipFromQ?: string,
    @Query("take") takeFromQ?: string
  ) {
    const org = await this.organisations.getOrgById(orgId);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    if (!org.member_ids.includes(user.id)) {
      return httpError(403, "You are not a member of this organisation");
    }

    let skip = parseInt(skipFromQ || "0"),
      take = parseInt(takeFromQ || "100");
    if (isNaN(skip)) skip = 0;
    if (isNaN(take)) take = 100;
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
      },
      include: {
        user: true
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
      },
      include: {
        user: true
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
      },
      include: {
        user: true
      }
    });
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post(":channelId/messages/file")
  @UseGuards(IsLoggedIn)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
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

    const channel = await this.channels.getChannel(channelId);
    if (!channel) {
      return httpError(404, "Channel not found");
    }

    if (!file) {
      return httpError(400, "File is required");
    }

    if (file.size > 2097152) {
      return httpError(400, "File must be smaller than 2mb");
    }

    const filen = file.originalname.split(".");
    const fileExt = filen.pop();
    const fileName = `messages/${orgId}/${channelId}/${nanoid.customAlphabet(
      "abcdefghijklmnopqrstuvwxyz1234567890",
      6
    )()}_${slugify(filen.join(".").substring(0, 100) + "." + fileExt, {
      replacement: "_",
      lower: true
    })}`;
    console.log(fileName);

    await new Promise((x, y) => {
      this.b2.s3.putObject(
        {
          Bucket: process.env.B2_BUCKET!,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype
        },
        (err, data) => {
          if (err) y(err);
          else x(data);
        }
      );
    });

    return await this.channels.db.chatMessages.create({
      data: {
        user: { connect: { id: user.id } },
        type: "file",
        content: fileName,
        channel: { connect: { id: channelId } }
      },
      include: {
        user: true
      }
    });
  }

  @Put(":channelId/messages/file/:messageId")
  updateFileMessage() {
    return httpError(501, "Updating file messages is not yet supported");
  }

  @Delete(":channelId/messages/file/:messageId")
  @UseGuards(IsLoggedIn)
  async deleteFileMessage(
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

    const fileName = message.content;
    await new Promise((x, y) => {
      this.b2.s3.deleteObject(
        {
          Bucket: process.env.B2_BUCKET!,
          Key: fileName
        },
        (err, data) => {
          if (err) y(err);
          else x(data);
        }
      );
    });

    return await this.channels.db.chatMessages.delete({
      where: {
        id: messageId
      },
      include: {
        user: true
      }
    });
  }
}
