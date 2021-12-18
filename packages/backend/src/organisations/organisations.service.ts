import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Organisation, OrganisationModel } from "./organisations.schema";
import { User } from "@/auth/users/users.schema";
import axios from "axios";

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectModel(Organisation.name) public organisations: OrganisationModel
  ) {}

  getOrgById(id: string) {
    return this.organisations.findById(id);
  }

  async createOrganisation(body: Omit<Organisation, "owner">, owner: User) {
    // check that imageUrl is a url from Imgur or Gravatar
    const imageUrl = new URL(body.imageUrl);
    if (imageUrl.hostname !== "i.imgur.com" && imageUrl.hostname !== "gravatar.com") {
      return "Image URL must be from either Imgur or Gravatar";
    }

    // check that imageUrl resolves to a valid image
    try {
      const res = await axios.get(body.imageUrl);
      if (res.status !== 200) {
        return "Image URL must resolve to a valid image";
      }
      if (
        !["image/png", "image/jpeg", "image/jpg"].includes(res.headers["content-type"])
      ) {
        return "Image URL should be a PNG or JPG image";
      }
    } catch (err) {
      return "Image URL must resolve to a valid image";
    }

    if (body.location && body.location.split(",").length > 2) {
      return 'Location format should be "City, Country" or "Country"';
    }

    // trim every string in body
    Object.keys(body).forEach(x => {
      // these dumb things have to be done because I'm bad at typescript
      // please submit a PR if you know a better way to avoid type errors
      const key = x as keyof typeof body;
      const item = body[key];
      if (typeof item === "string") {
        body[key] = item!.trim() as any;
      }
    });

    return await this.organisations.create({
      ...body,
      owner
    });
  }

  getUserOrgs(userId: string) {
    return this.organisations.find({ owner: userId }).exec();
  }

  getUserMemberships(userId: string) {
    // get organisations where the members contains the user's id
    return this.organisations
      .find({
        members: {
          $elemMatch: {
            $eq: userId
          }
        }
      })
      .exec();
  }
}
