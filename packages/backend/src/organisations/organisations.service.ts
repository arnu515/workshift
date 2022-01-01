import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import axios from "axios";
import type { User } from "@prisma/client";
import {
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsOptional
} from "class-validator";

export class CreateOrganisationBody {
  @MinLength(4)
  @MaxLength(128)
  @IsNotEmpty()
  name: string;

  @MinLength(4)
  @MaxLength(2048)
  @IsNotEmpty()
  description: string;

  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsOptional()
  @MaxLength(2048)
  address?: string;

  @IsOptional()
  @MaxLength(2048)
  location?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateOrganisationBody {
  @MinLength(4)
  @MaxLength(128)
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @MinLength(4)
  @MaxLength(2048)
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsOptional()
  @MaxLength(2048)
  address?: string;

  @IsOptional()
  @MaxLength(2048)
  location?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@Injectable()
export class OrganisationsService {
  constructor(private db: PrismaService) {}

  async getJoinedOrgs(userId: string) {
    const org = await this.db.organisation.findMany({
      // this doesn't work for some reason
      // where: {
      //   member_ids: { has: userId }
      // },
      include: {
        owner: true
      }
    });

    // i have to manually filter the results. Prisma please fix this
    // then again, i might be doing something wrong, but i don't know
    return org.filter(x => x.member_ids.includes(userId));
  }

  async getOrgWithMembers(orgId: string) {
    return this.db.organisation.findFirst({
      where: { id: orgId },
      include: {
        members: true
      }
    });
  }

  getOrgById(id: string) {
    return this.db.organisation.findFirst({ where: { id }, include: { owner: true } });
  }

  async createOrganisation(body: CreateOrganisationBody, owner: User) {
    // check that imageUrl is a url from Imgur or Gravatar
    if (body.imageUrl) {
      const imageUrl = new URL(body.imageUrl);
      if (
        !["i.imgur.com", "gravatar.com", "assets.workshift.gq"].includes(
          imageUrl.hostname
        )
      ) {
        return "Image URL must be from either Imgur or Gravatar or be locally hosted";
      }

      // check that imageUrl resolves to a valid image
      try {
        const res = await axios.get(body.imageUrl);
        if (res.status !== 200) {
          return "Image URL must resolve to a valid image";
        }
        if (
          !["image/png", "image/jpeg", "image/jpg"].includes(
            res.headers["content-type"]
          )
        ) {
          return "Image URL should be a PNG or JPG image";
        }
      } catch (err) {
        return "Image URL must resolve to a valid image";
      }
    }

    if (body.location && body.location.split(",").length > 2) {
      return 'Location format should be "City, Country" or "Country"';
    }

    // trim every string in body
    Object.keys(body).forEach(x => {
      const key = x as keyof typeof body;
      if (typeof body[key] === "string") {
        // I genuinely do not know why I have to cast this to never.
        // If you're good at typescript, and know a fix, please PR it up!
        body[key] = body[key]!.toString().trim() as never;
      }
    });

    return await this.db.organisation.create({
      data: {
        ...body,
        owner_id: owner.id,
        member_ids: [owner.id]
      }
    });
  }

  async updateOrganisation(orgId: string, body: UpdateOrganisationBody) {
    if (body.imageUrl) {
      // check that imageUrl is a url from Imgur or Gravatar
      const imageUrl = new URL(body.imageUrl);
      if (
        !["i.imgur.com", "gravatar.com", "assets.workshift.gq"].includes(
          imageUrl.hostname
        )
      ) {
        return "Image URL must be from either Imgur or Gravatar or be locally hosted";
      }

      // check that imageUrl resolves to a valid image
      try {
        const res = await axios.get(body.imageUrl);
        if (res.status !== 200) {
          return "Image URL must resolve to a valid image";
        }
        if (
          !["image/png", "image/jpeg", "image/jpg"].includes(
            res.headers["content-type"]
          )
        ) {
          return "Image URL should be a PNG or JPG image";
        }
      } catch (err) {
        return "Image URL must resolve to a valid image";
      }
    }

    if (body.location && body.location.split(",").length > 2) {
      return 'Location format should be "City, Country" or "Country"';
    }

    // trim every string in body
    Object.keys(body).forEach(x => {
      const key = x as keyof typeof body;
      if (typeof body[key] === "string") {
        // I genuinely do not know why I have to cast this to never.
        // If you're good at typescript, and know a fix, please PR it up!
        body[key] = body[key]!.toString().trim() as never;
      }
    });

    return await this.db.organisation.update({
      where: {
        id: orgId
      },
      data: {
        ...body
      }
    });
  }

  async deleteOrganisation(orgId: string) {
    return await this.db.organisation.delete({
      where: {
        id: orgId
      }
    });
  }

  async addUserToOrg(userId: string, orgId: string) {
    const org = await this.db.organisation.findFirst({
      where: { id: orgId }
    });
    if (!org) {
      return "Organisation not found";
    }

    if (org.member_ids.includes(userId)) {
      return "User is already a member of this organisation";
    }

    return await this.db.organisation.update({
      where: { id: orgId },
      data: {
        member_ids: {
          set: [...org.member_ids, userId]
        }
      }
    });
  }

  async removeMemberFromOrg(userId: string, orgId: string) {
    const org = await this.db.organisation.findFirst({
      where: { id: orgId }
    });
    if (!org) {
      return "Organisation not found";
    }

    if (!org.member_ids.includes(userId)) {
      return "User is not a member of this organisation";
    }

    return await this.db.organisation.update({
      where: { id: orgId },
      data: {
        members: {
          disconnect: { id: userId }
        }
      }
    });
  }
}
