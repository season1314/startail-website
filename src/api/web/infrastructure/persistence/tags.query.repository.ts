import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tags } from '@schema/articles.tags.schema';
import { ITagsQueryRepository } from '@domain/repositories/tags-query.repository.interface';
import { TagsModel } from '@domain/models/tags.model';

@Injectable()
export class TagsQueryRepository implements ITagsQueryRepository {
    constructor(
        @InjectModel(Tags.name) private readonly tagsModel: Model<Tags>,
    ) { }


    async getTagItem(id: string) {
        const rawData = await this.tagsModel
            .findOne({ _id: id })
            .lean()
            .exec();
        return new TagsModel(rawData);
    }
}