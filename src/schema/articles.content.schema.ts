import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,Types} from 'mongoose';


@Schema({ timestamps: true })
export class Articles extends Document {
    @Prop({ type: Object, default: {} })
    name: Record<string, any>

    @Prop({ type: Object, default: {} })
    categories: Record<string, any>;

    @Prop({ type: Object, default: {} })
    introduction: Record<string, any>

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Tags' }] })
    tags: Types.ObjectId[] | any[]

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

    @Prop({ default: 0 })
    view: number

    @Prop({ type: Object, default: {} })
    users: Record<string, any>

    @Prop()
    createdBy?: string;

    createdAt: Date;
    updatedAt: Date
}

export const ArticlesSchema = SchemaFactory.createForClass(Articles);


ArticlesSchema.set('toJSON', { virtuals: true });
ArticlesSchema.set('toObject', { virtuals: true });

