import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Config extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Object, default: {} })
    property: Record<string, any>;

    @Prop({ unique: true, required: true })
    key: string

    @Prop()
    createdBy?: string;

    createdAt: Date;
    updatedAt: Date
}

export const ConfigSchema = SchemaFactory.createForClass(Config);


ConfigSchema.set('toJSON', { virtuals: true });
ConfigSchema.set('toObject', { virtuals: true });



