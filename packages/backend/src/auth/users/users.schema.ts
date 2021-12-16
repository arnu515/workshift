import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Model, Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ requried: true, unique: true })
  email: string;

  @Prop({ requried: true })
  username: string;

  @Prop({ enum: ['local', 'github', 'discord'] })
  provider: string;

  // providerId will be the user's hashed password when using "local" provider
  @Prop({ requried: true })
  providerId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  providerData?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserModel = Model<User & Document>;
