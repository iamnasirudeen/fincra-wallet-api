import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MSchema } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type TransactionLogDocument = TransactionLog & Document;

export enum ETransactionStatus {
  'processing' = 'PROCESSING',
  'completed' = 'COMPLETED',
}

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class TransactionLog {
  @Prop({ type: String, required: true, unique: true })
  idempotencyKey: string;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: MSchema.Types.ObjectId, ref: User.name })
  recipient: Types.ObjectId;

  @Prop({ type: String })
  narration: string;

  @Prop({ type: String, enum: ['PROCESSING', 'COMPLETED'] })
  transactionStatus: string;

  @Prop({ type: String })
  transactionHash: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: User.name })
  initiatedBy: Types.ObjectId;
}

export const TransactionLogSchema =
  SchemaFactory.createForClass(TransactionLog);
