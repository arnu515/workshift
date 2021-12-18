import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Model, Document, Schema as MongooseSchema } from "mongoose";

@Schema()
export class OrganisationInvite {
  @Prop({ required: true, ref: "User", type: MongooseSchema.Types.ObjectId })
  toUser: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, ref: "Organisation", type: MongooseSchema.Types.ObjectId })
  organisation: MongooseSchema.Types.ObjectId;
}

export const OrganisationInviteSchema =
  SchemaFactory.createForClass(OrganisationInvite);

export type OrganisationInviteModel = Model<OrganisationInvite & Document>;
