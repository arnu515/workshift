import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

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
}

export const OrganisationSchema = SchemaFactory.createForClass(Organisation);

export type OrganisationModel = Model<Organisation & Document>;
