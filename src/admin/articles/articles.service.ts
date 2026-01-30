import { Injectable } from '@nestjs/common';
import type { response } from '../../interface'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from '../../schema/articles.tags.schema'
import { Config } from '../../schema/config.common.schema'
import { Articles } from '../../schema/articles.content.schema'
import dayjs from 'dayjs';
import { GetListDto } from '../admin_core.dto';
import { TagsDto } from '../articles/articles.dto'
import { MemoryStorageService } from '../../memory-storage.service';
import { CommonMethods } from '../../common.method'
import { ConfigService } from '@nestjs/config';
import { Comment } from '../../schema/articles.comment.schema'



@Injectable()
export class ArticlesService {
    constructor(
        @InjectModel(Tags.name) private tagsModel: Model<Tags>,
        @InjectModel(Config.name) private configModel: Model<Config>,
        @InjectModel(Articles.name) private contentModel: Model<Articles>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        private readonly memoryStorageService: MemoryStorageService,
        private readonly configService: ConfigService

    ) { }

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
            this.tagsModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(dto.entries).lean().exec(),
            this.tagsModel.find(query).countDocuments(),
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
     * Get article detail
     * @param id 
     * @returns 
     */
    async getDetail(id: string | number) {
        try {
            let configLang = this.memoryStorageService.get('languages')//look up supported languages from memory first to build the multi-language query
            if (!configLang) {
                const lang = await this.configModel.findOne({ key: 'languages' }).select('property -_id')
                configLang = CommonMethods.getArrayObjectKey(lang?.property)
                this.memoryStorageService.set('languages', configLang)
            }
            let configCategories = this.memoryStorageService.get('categories')//look up supported categories from memory first to build the multi-categories query
            if (!configCategories) {
                const categories = await this.configModel.findOne({ key: 'categories' }).select('property -_id')
                configCategories = CommonMethods.getArrayObjectKey(categories?.property)
                this.memoryStorageService.set('categories', configCategories)
            }
            const configOs = [{ 'Window': false }, { 'macOS': false }, { 'iOS': false }, { 'Android': false }, { 'Linux': false }, { 'Web': false }]

            if (id == 0) {
                const categories = configCategories.map((item) => {
                    return { [item]: false };
                })

                let guides = {}, downloads = {}, title = {}, introduction = {}
                configLang.map((item: string) => {
                    guides[item] = []
                    downloads[item] = []
                    title[item] = ""
                    introduction[item] = ""
                })
                return {
                    title: 'Articles Create',
                    articleId: id,
                    configLang: configLang,
                    tags: [],
                    categories,
                    os: configOs,
                    guides,
                    downloads,
                    bc: [
                        { url: '/admin', name: 'Dashboard' },
                        { url: '/admin/articles/content', name: 'Articles' },
                        { url: '#', name: 'Create' },
                    ],
                }
            }

            const data = await this.contentModel.findOne({ _id: id })
            if (!data) return false
            const matchedTags = await this.tagsModel.find({ _id: { $in: data.tags } }).select('_id name').lean().exec();

            const categories = configCategories.map((item) => {//format categories data
                if (data.categories.includes(item)) {
                    return { [item]: true };
                } else {
                    return { [item]: false };
                }
            })

            const os = configOs.map((item) => {  //format os data
                const key = Object.keys(item)[0];
                return {
                    [key]: data.os.includes(key)
                }
            })
            return {
                title: 'Article Update',
                articleId: data._id,
                configLang: configLang,
                tags: data.tags,
                matchedTags: matchedTags,
                categories: categories,
                name: data.name,
                introduction: data.introduction,
                os: os,
                guides: data.guides,
                downloads: data.downloads,
                coverImg: data.coverImg,
                url: this.configService.get<string>('IMG_URL') + data.coverImg,
                bc: [
                    { url: '/admin', name: 'Dashboard' },
                    { url: '/admin/articles/content', name: 'Articles' },
                    { url: '#', name: 'Update' },
                ],
            }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }


    /**
     * Create new article
     * @param dto 
     * @param createBy
     */
    async createDetail(dto: any, createdBy: string) {
        try {
            const verifyParameter = await this.checkArticle(dto)
            if (verifyParameter) return verifyParameter
            const cacheKey = 'article:' + dto.name.en + createdBy
            const exists = this.memoryStorageService.get(cacheKey);//use cache for debouncing
            if (exists) return { code: 1, messages: "Article submitted.Please wait 120 seconds before resubmitting same name article." }
            this.memoryStorageService.set(cacheKey, true, 120)
            const created = new this.contentModel({
                name: dto.name,
                introduction: dto.introduction,
                categories: dto.categories,
                tags: dto.tags,
                downloads: dto.downloads,
                coverImg: dto.coverImg,
                guides: dto.guides,
                os: dto.os,
                status: 1,
                createdInfo: { name: 'StarTail', email: 'haoqingshuang@gmail.com' },
                createdBy: createdBy
            }).save()
            return { code: 0, messages: 'Successfully created new article' };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }


    /**
     * Update current article
     * @param dto 
     * @returns 
     */
    async updateDetail(dto: any) {
        try {
            if (!dto.id) return { code: 1, messages: 'System error: Id is missing' }
            const verifyParameter = await this.checkArticle(dto)
            if (verifyParameter) return verifyParameter
            const article = await this.contentModel.findOne({ _id: dto.id })
            if (!article) return { code: 1, messages: 'The article is not existed' }
            article.name = dto.name
            article.introduction = dto.introduction
            article.categories = dto.categories
            article.coverImg = dto.coverImg
            article.tags = dto.tags
            article.os = dto.os
            article.guides = dto.guides
            article.downloads = dto.downloads
            await article.save()
            this.memoryStorageService.delete('indexList') //delete the index List key in caches
            return { code: 0, messages: 'Successfully updated article' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Update article status 
     * @param id 
     * @returns 
     */
    async statusDetail(id: string | number) {
        try {
            if (!id) return { code: 1, messages: 'System error: Id is missing' }
            const article = await this.contentModel.findOne({ _id: id })
            if (!article) return { code: 1, messages: 'The article is not existed' }
            if (article.status != 0) {
                article.status = 0
            } else {
                article.status = 1
            }
            await article.save()
            this.memoryStorageService.delete('indexList') //delete the index List key in caches
            return { code: 0, messages: 'Successfully updated article status' }

        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Delete article
     * @param id 
     * @returns 
     */

    async deleteDetail(id: string | number) {
        try {
            if (!id) return { code: 1, messages: 'System error: Id is missing' }
            const article = await this.contentModel.findOne({ _id: id })
            if (!article) return { code: 1, messages: 'The article is not existed' }
            await this.contentModel.deleteOne({ _id: id });
            this.memoryStorageService.delete('indexList') //delete the index List key in caches
            return { code: 0, messages: 'Successfully deleted article' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Get articles list
     * @param dto 
     * @returns 
     */
    async contentList(dto: GetListDto): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        let configLang = this.memoryStorageService.get('languages')//look up supported languages from memory first to build the multi-language query
        if (!configLang) {
            const lang = await this.configModel.findOne({ key: 'languages' }).select('property -_id')
            configLang = CommonMethods.getArrayObjectKey(lang?.property)
            this.memoryStorageService.set('languages', configLang)
        }

        const query: any = {};
        if (dto.keyword) {
            query.$or = configLang.map(lang => ({
                [`name.${lang}`]: { $regex: dto.keyword, $options: 'i' }
            }));
        }
        const [list, total] = await Promise.all([
            this.contentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(dto.entries).lean().exec(),
            this.contentModel.find(query).countDocuments(),
        ])
        const imgUrl = this.configService.get<string>('IMG_URL')

        const formatList = await Promise.all(
            list.map(async item => {
                const count = await this.commentModel.countDocuments({
                    commentId: item._id,
                });
                return {
                    ...item,
                    coverImg: this.configService.get<string>('IMG_URL') + item.coverImg,
                    createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                    commentCount: count,
                };
            }),
        );

        return {
            code: 0,
            data: {
                list: formatList,
                total,
                page: dto.page,
                pageSize: dto.entries,
                totalPages: Math.ceil(total / dto.entries),
            }
        };
    }


    /**
     * Check create/edit article parameters
     * @param dto 
     * @returns 
     */
    private async checkArticle(dto: any) {
        if (!dto) return { code: 1, messages: "'System error: data is null" }
        const name = dto.name.en || ''
        if (!name) return { code: 2, messages: { "#name-en": ['name is required'] } };
        const introduction = dto.introduction.en || ''
        if (!introduction) return { code: 2, messages: { "#introduction-en": ['introduction is required'] } };
        if (dto.categories.length <= 0) return { code: 2, messages: { "#categories-en": ['please select at least one category'] } };
        if (!dto.coverImg) return { code: 2, messages: { "#cover-image": ['cover image is required'] } };
        return false
    }
}
