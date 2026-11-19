import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'validations', timestamps: true, versionKey: false })
export class Validation {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, index: true })
  documentNumber: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ValidationDocument = HydratedDocument<Validation>;

export const ValidationSchema = SchemaFactory.createForClass(Validation);