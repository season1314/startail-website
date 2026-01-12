import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Articles } from '../../../../schema/articles.content.schema';
import { IArticlesQueryRepository } from '../../domain/repositories/articles-query.repository.interface';
import { ArticlesModel } from '../../domain/models/articles.model';

@Injectable()
export class ArticlesQueryRepository implements IArticlesQueryRepository {
    constructor(
        @InjectModel(Articles.name) private readonly articlesModel: Model<Articles>,
    ) { }

    async getPublishedList(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const rawData = await this.articlesModel
            .find({ status: 0 })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('tags')
            .lean()
            .exec();
        return (rawData as any[]).map(item => new ArticlesModel(item));
    }

    async categoryPublishedList(page: number, limit: number, category: string) {
        const skip = (page - 1) * limit;
        const query: any = {
            status: 0,
            categories: { $regex: `^${category}$`, $options: 'i' }
        }
        const rawData = await this.articlesModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('tags')
            .lean()
            .exec();
        return (rawData as any[]).map(item => new ArticlesModel(item));
    }

    async tagsPublishedList(page: number, limit: number, tagId: string) {
        const skip = (page - 1) * limit;
        const query: any = {
            status: 0,
            tags: { $in: tagId }
        }
        const rawData = await this.articlesModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('tags')
            .lean()
            .exec();
        return (rawData as any[]).map(item => new ArticlesModel(item));
    }

    async searchPublishedList(page: number, limit: number, keyword: string, category: string, langs: string[]) {
        const skip = (page - 1) * limit;
        const regex = new RegExp(keyword, 'i')
        const fields = ['name', 'introduction'];
        //search all languages in name or introductions
        const orConditions = fields.flatMap(field =>
            langs.map(lang => ({
                [`${field}.${lang}`]: regex
            }))
        );
        const query: any = {
            status: 0,
            $or: orConditions
        }
        //if category not null
        if (category) { query.categories = category; }

        const rawData = await this.articlesModel.find(query).skip(skip).limit(limit).populate('tags').lean().exec()

        return (rawData as any[]).map(item => new ArticlesModel(item))
    }
}