// src/admin/admin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  nickname?: string;

  @Prop()
  avatar?: string;

  @Prop()
  permissions: string[];

  @Prop()
  status: number;

  @Prop()
  createdBy?: string;

  createdAt: Date;
  updatedAt: Date
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


AdminSchema.set('toJSON', { virtuals: true });
AdminSchema.set('toObject', { virtuals: true });



