import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export enum CommentStatus {
    self = 'self',
    public = 'public',
}

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ required: true, ref: 'User' })
    userId: string;

    @Prop({ required: true, ref: 'Articles' })
    articleId: string;

    @Prop({ ref: 'Comment' })
    commentId: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true, enum: CommentStatus })
    status: CommentStatus;

    @Prop({ default: false })
    delete: boolean


    createdAt: Date;
    updatedAt: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment);


CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

