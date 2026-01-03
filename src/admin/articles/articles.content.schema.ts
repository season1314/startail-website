import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Articles extends Document {
    @Prop({ type: Object, default: {} })
    Name: Record<string, any>

    @Prop({ type: Object, default: {} })
    categories: Record<string, any>;

    @Prop({ type: Object, default: {} })
    introduction: Record<string, any>

    @Prop({ type: Object, default: {} })
    tags: Record<string, any>

    @Prop({ type: Object, default: {} })
    downloads: Record<string, any>

    @Prop()
    coverImg: string

    @Prop({ type: Object, default: {} })
    createdInfo: Record<string, any>

    @Prop({ type: Object, default: {} })
    guides: Record<string, any>

    @Prop({ type: Object, default: {} })
    os: Record<string, any>

    @Prop()
    status: number;

    @Prop()
    createdBy?: string;

    createdAt: Date;
    updatedAt: Date
}

export const ArticlesSchema = SchemaFactory.createForClass(Articles);


ArticlesSchema.set('toJSON', { virtuals: true });
ArticlesSchema.set('toObject', { virtuals: true });

