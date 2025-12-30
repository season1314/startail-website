import { Injectable } from '@nestjs/common';
import type { response } from '../admin_interface'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from './articles.tags.schema'
import { Config } from '../config/config.common.schema'
import dayjs from 'dayjs';
import { GetListDto } from '../admin_core.dto';
import { TagsDto } from '../articles/articles.dto'



@Injectable()
export class ArticlesService {
    constructor(@InjectModel(Tags.name) private tagsModel: Model<Tags>, @InjectModel(Config.name) private configModel: Model<Config>) { }

    /**
     * Get administrator list
     * @param dto 
     * @returns 
     */
    async getTags(dto: GetListDto): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = {};
        if (dto.keyword) {
            query.$or = [
                { name: { $regex: dto.keyword, $options: 'i' } },
            ];
        }
        const [list, total, lang] = await Promise.all([
            this.tagsModel.find().sort({ createdAt: -1 }).skip(skip).limit(dto.entries).lean(),
            this.tagsModel.countDocuments(),
            this.configModel.findOne({ key: 'languages' }).select('property -_id')
        ])
        const formatList = list.map(item => ({
            ...item,
            display: item.lang.map(item => { const key = Object.keys(item)[0]; const value = item[key]; if (value) { return `${key}:${value}` } }).filter(Boolean).join(','),
            createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }));
        return {
            code: 0,
            data: {
                list: formatList,
                total,
                page: dto.page,
                pageSize: dto.entries,
                lang: lang?.property,
                totalPages: Math.ceil(total / dto.entries),
            }
        };
    }

    /**
     * Create new tag
     * @param dto 
     * @param createBy 
     * @returns 
     */
    async createTag(dto: TagsDto, createBy: string): Promise<response> {
        try {
            const existingTagsName = await this.tagsModel.findOne({ name: { $regex: new RegExp(`^${dto.name}$`, 'i') } });
            if (existingTagsName) return { code: 2, messages: { username: ['Tag name already exists'] } };
            const result = dto.lang?.find(item => item.hasOwnProperty('en'));
            if (!result.en) return { code: 2, messages: { 'lang-en': ['english display name can not empty'] } };
            const created = new this.tagsModel({
                name: dto.name,
                lang: dto.lang,
                type: dto.type,
                createdBy: createBy
            }).save()
            return { code: 0, messages: 'Successful created new tag' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Update tag
     * @param dto 
     * @returns 
     */

    async updateTag(dto: TagsDto): Promise<response> {
        try {
            if (!dto.id) return { code: 1, messages: 'System error:Id is missing' }
            const result = dto.lang?.find(item => item.hasOwnProperty('en'));
            if (!result.en) return { code: 2, messages: { 'lang-en': ['english display name can not empty'] } };
            const existingTagsName = await this.tagsModel.findOne({ name: { $regex: new RegExp(`^${dto.name}$`, 'i') }, _id: { $ne: dto.id } });
            if (existingTagsName) return { code: 2, messages: { name: ['Tag name already exists'] } };
            const tag = await this.tagsModel.findOne({ _id: dto.id })
            if (!tag) return { code: 1, messages: 'The tag is not existed' }
            tag.name = dto.name
            tag.lang = dto.lang
            tag.type = dto.type
            await tag.save()
            return { code: 0, messages: 'Successful update tag' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }


    /**
     * Delete tag 
     * @param id 
     * @returns 
     */
    async deleteTag(id: string): Promise<response> {
        try {
            if (!id) return { code: 1, messages: 'System error:Id is missing' }
            const tag = await this.tagsModel.findOne({ _id: id })
            if (!tag) return { code: 1, messages: 'The tag is not existed' }
            const result = await this.tagsModel.deleteOne({ _id: tag._id });
            return { code: 0, messages: 'Successfully delete administrator : ' + tag.name };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     *
     */
    async getDetail(id: string | number) {
        try {
            const configLang = await this.configModel.findOne({ key: 'languages' }).select('property -_id')
            const configCategories = await this.configModel.findOne({ key: 'categories' }).select('property -_id')
            if (id == 0) {
                const categories = configCategories?.property.map((item) => {
                    return { [Object.keys(item)[0]]: false };
                })
                const os = [{ 'Window': false }, { 'macOS': false }, { 'iOS': false }, { 'Android': false }, { 'Linux': false }, { 'Web': false }]
                return {
                    title: 'Articles',
                    articleId: id,
                    configLang,
                    data: { categories, os }
                }
            }

            return {
                title: 'Article Details',
                articleId: id,
                // data: { lang: lang, category: category }
            }
        } catch (error) {

        }
    }
}
