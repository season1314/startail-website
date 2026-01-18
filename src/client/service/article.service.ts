import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from '../../schema/articles.tags.schema'
import { Config } from '../../schema/config.common.schema'
import { Articles } from '../../schema/articles.content.schema'
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { GetListDto } from '../../admin/admin_core.dto'
import { response } from 'src/admin/admin_interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'


@Injectable()
export class ArticlesClientService {
    private readonly imgUrl: string;
    constructor(
        @InjectModel(Tags.name) private tagsModel: Model<Tags>,
        @InjectModel(Config.name) private configModel: Model<Config>,
        @InjectModel(Articles.name) private contentModel: Model<Articles>,
        private readonly configService: ConfigService,
        private readonly memoryStorageService: MemoryStorageService,
    ) { this.imgUrl = this.configService.get<string>('IMG_URL', ''); }

    /**
     * Get articles list
     * @param dto 
     * @returns 
     */
    async getArticleList(dto: GetListDto, lang: string = 'en'): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = { status: 0 };
        let configCategories = await this.memoryStorageService.get('categories') // first get categories config from cache
        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean()
        const formatList = list.map(item => {
            const { name, introduction, guides, downloads, ...rest } = item
            const _guides = item.guides[lang] ? item.guides[lang] : item.guides['en']
            const _downloads = item.downloads[lang] ? item.downloads[lang] : item.introduction['en']
            return {
                ...rest,
                tags: item.tags.map(tag => {
                    const id = tag._id?.toString();
                    const langObj = Array.isArray(tag.lang)
                        ? tag.lang.find(l => l.hasOwnProperty(lang))
                        : null;
                    return {
                        id: id,
                        name: langObj ? langObj[lang] : langObj['en'],
                        active:""
                    }
                }),
                coverImg: this.imgUrl + item.coverImg,
                title: item.name[lang] ? item.name[lang] : item.name['en'],
                des: item.introduction[lang] ? item.introduction[lang] : item.introduction['en'],
                createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                files: _guides.concat(_downloads)
            }
        });
        return {
            code: 0,
            data: {
                list: formatList,
                page: dto.page
            }
        };
    }

    /**
     * Get articles list by category
     * @param dto 
     * @param lang 
     * @param category 
     * @returns 
     */
    async getArticleListByCategory(dto: GetListDto, lang: string = "en", category: string): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = { status: 0 };
        if (!category) return { code: 1, messages: 'Category key cannot be null' }
        let configCategories = await this.memoryStorageService.get('categories') // first get categories config from cache
        if (!configCategories) {
            const categories = await this.configModel.findOne({ key: 'categories' }).select('property -_id')
            configCategories = await CommonMethods.getArrayObjectKey(categories?.property)
            await this.memoryStorageService.set('categories', configCategories)
        }
        const isCategoryExisted = configCategories.includes(category)
        if (!isCategoryExisted) return { code: 1, messages: 'System error : Can not find this category in config' }
        query.categories = category
        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean()
        const formatList = list.map(item => {
            const { name, introduction, guides, downloads, ...rest } = item
            const _guides = item.guides[lang] ? item.guides[lang] : item.guides['en']
            const _downloads = item.downloads[lang] ? item.downloads[lang] : item.introduction['en']
            return {
                ...rest,
                tags: item.tags.map(tag => {
                    const id = tag._id?.toString();
                    const langObj = Array.isArray(tag.lang) ? tag.lang.find(l => l.hasOwnProperty(lang)) : null;
                    return {
                        id: id,
                        name: langObj ? langObj[lang] : langObj['en'],
                        active:""
                    }
                }),
                coverImg: this.imgUrl + item.coverImg,
                title: item.name[lang] ? item.name[lang] : item.name['en'],
                des: item.introduction[lang] ? item.introduction[lang] : item.introduction['en'],
                createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                files: _guides.concat(_downloads)
            }
        });
        return {
            code: 0,
            data: {
                list: formatList,
                page: dto.page
            }
        };
    }

    /**
     * get article list be tagId 
     * @param dto 
     * @param lang 
     * @param tagId 
     * @returns 
     */
    async getArticleListByTagId(dto: GetListDto, lang: string = "en", tagId: string): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = { status: 0 };
        if (!tagId) return { code: 1, messages: 'Tag id cannot be null' }


        const isTagExisted = await this.tagsModel.findOne({ _id: tagId }).lean()
        if (!isTagExisted) return { code: 1, messages: 'System error : Can not find this tag' }
        const tagObj = isTagExisted.lang.find(item => Object.keys(item)[0] === lang);
        const tagName = tagObj ? Object.values(tagObj)[0] : null;
        const tags = { _id: isTagExisted._id, name: tagName }

        query.tags = tagId

        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean()
        const formatList = list.map(item => {
            const { name, introduction, guides, downloads, ...rest } = item
            const _guides = item.guides[lang] ? item.guides[lang] : item.guides['en']
            const _downloads = item.downloads[lang] ? item.downloads[lang] : item.introduction['en']
            return {
                ...rest,
                tags: item.tags.map(tag => {
                    const id = tag._id?.toString();
                    const langObj = Array.isArray(tag.lang) ? tag.lang.find(l => l.hasOwnProperty(lang)) : null;
                    return {
                        id: id,
                        name: langObj ? langObj[lang] : langObj['en'],
                        active: id == tagId ? "active" : ""
                    }
                }),
                coverImg: this.imgUrl + item.coverImg,
                title: item.name[lang] ? item.name[lang] : item.name['en'],
                des: item.introduction[lang] ? item.introduction[lang] : item.introduction['en'],
                createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                files: _guides.concat(_downloads)
            }
        });
        return {
            code: 0,
            data: {
                list: formatList,
                page: dto.page,
                tag: tags
            }
        };
    }

    /**
     * search articles
     * @param dto 
     * @param lang 
     * @param keyword 
     * @param category 
     * @returns 
     */

    async searchArticles(dto: GetListDto, lang: string = "en", keyword: string = "", category: string = ""): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const regex = new RegExp(keyword, 'i')
        const fields = ['name', 'introduction'];

        let configLang = await this.memoryStorageService.get('languages')//cache first
        if (!configLang) {
            const lang = await this.configModel.findOne({ key: 'languages' }).select('property -_id')
            configLang = await CommonMethods.getArrayObjectKey(lang?.property)
            await this.memoryStorageService.set('languages', configLang)
        }
        //search all languages in name or introductions
        const orConditions = fields.flatMap(field =>
            configLang.map(lang => ({
                [`${field}.${lang}`]: regex
            }))
        );
        const query: any = {
            status: 0,
            $or: orConditions
        }
        //if category not null
        if (category) { query.categories = category; }
        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean()
        const formatList = list.map(item => ({
            ...item,
            tags: item.tags.map(tag => {
                const id = tag._id?.toString();
                const langObj = Array.isArray(tag.lang)
                    ? tag.lang.find(l => l.hasOwnProperty(lang))
                    : null;
                return {
                    id: id,
                    name: langObj ? langObj[lang] : langObj['en']
                }
            }),
            title: item.name[lang] ? { lang: lang, name: item.name[lang] } : { lang: 'en', name: item.name['en'] },
            des: item.introduction[lang] ? { lang: lang, content: item.introduction[lang] } : { lang: lang, content: item.introduction['en'] },
            downloads: item.downloads[lang] ? item.downloads[lang] : item.introduction['en'],
            createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
            guides: item.guides[lang] ? item.guides[lang] : item.guides['en']
        }));
        return {
            code: 0,
            data: {
                list: formatList,
                page: dto.page
            }
        };
    }

    /**
     * Add article view count
     * @param articleId 
     * @param count 
     * @returns 
     */
    async addViewCount(articleId: string, count: number): Promise<response> {
        try {
            if (articleId) return { code: 1, messages: 'ArticleId cannot be null' }
            const article = await this.contentModel.findOne({ _id: articleId })
            if (!article) return { code: 1, messages: 'Article is not existed' }
            article.view = article.view + count
            await article.save()
            return { code: 0, data: article }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }
}