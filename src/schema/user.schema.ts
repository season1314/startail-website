import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  nickname: string;

  @Prop()
  avatar: string;

  @Prop()
  status: number;

  createdAt: Date;
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });



