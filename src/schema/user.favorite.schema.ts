import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Favorite extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, ref: 'Articles' })
    articleId: string;

    createdAt: Date;
    updatedAt: Date
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);


FavoriteSchema.set('toJSON', { virtuals: true });
FavoriteSchema.set('toObject', { virtuals: true });



