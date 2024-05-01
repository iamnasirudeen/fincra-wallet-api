import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  password: string;

  /**
   * walletBalance is reequired so I personally dont miss when creating a user.
   * its not required from the DTO and any value passed from the DTO will be discarded
   */
  @Prop({ type: Number, required: true, default: 0 })
  walletBalance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
