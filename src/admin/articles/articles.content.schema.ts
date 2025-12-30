import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class articles extends Document {
    @Prop({ type: Object, default: {} })
    title: Record<string, any>

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

    createdAt: Date;
    updatedAt: Date
}

export const ArticlesSchema = SchemaFactory.createForClass(articles);


ArticlesSchema.set('toJSON', { virtuals: true });
ArticlesSchema.set('toObject', { virtuals: true });

