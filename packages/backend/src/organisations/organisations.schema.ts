import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Model, Document, Schema as MongooseSchema } from "mongoose";
import type { User } from "@/auth/users/users.schema";

@Schema()
export class Organisation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  website?: string;

  @Prop()
  address?: string;

  @Prop()
  location?: string;

  @Prop()
  email?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  owner: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }] })
  members?: User[];
}

export const OrganisationSchema = SchemaFactory.createForClass(Organisation);

export type OrganisationModel = Model<Organisation & Document>;
