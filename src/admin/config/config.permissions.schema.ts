import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


enum HttpMethod {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

@Schema({ timestamps: true })
export class Permissions extends Document {
    @Prop({ unique: true, required: true })
    name: string;

    @Prop()
    des: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true, enum: HttpMethod})
    method: HttpMethod;

    @Prop({ required: true })
    key: string

    @Prop()
    createdBy?: string;

    createdAt: Date;
    updatedAt: Date
}

export const PermissionsSchema = SchemaFactory.createForClass(Permissions);

PermissionsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});


PermissionsSchema.set('toJSON', { virtuals: true });
PermissionsSchema.set('toObject', { virtuals: true });



