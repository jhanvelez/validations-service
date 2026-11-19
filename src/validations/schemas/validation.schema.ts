import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ExchangeRate {
  @Prop({ type: String, required: true })
  provider: string;

  @Prop({ type: String, required: true })
  baseCurrency: string;

  @Prop({ type: String, required: true })
  targetCurrency: string;

  @Prop({ type: Number, required: true })
  rate: number;

  @Prop({ type: Date, required: true })
  rateUpdatedAt: Date;

  @Prop({ type: Date, required: true })
  fetchedAt: Date;
}

const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);

@Schema({ collection: 'validations', timestamps: true, versionKey: false })
export class Validation {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, index: true })
  documentNumber: string;

  @Prop({ type: ExchangeRateSchema, required: true })
  exchangeRate: ExchangeRate;

  createdAt: Date;
  updatedAt: Date;
}

export type ValidationDocument = HydratedDocument<Validation>;

export const ValidationSchema = SchemaFactory.createForClass(Validation);