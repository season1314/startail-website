// src/admin/admin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Tags extends Document {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop({ type: Object, default: {} })
  text: Record<string, any>;


  @Prop()
  createdBy?: string;

  createdAt: Date;
  updatedAt: Date
}

export const TagsSchema = SchemaFactory.createForClass(Tags);

TagsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


TagsSchema.set('toJSON', { virtuals: true });
TagsSchema.set('toObject', { virtuals: true });



