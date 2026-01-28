import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from '../../schema/articles.tags.schema'
import { Config } from '../../schema/config.common.schema'
import { Articles } from '../../schema/articles.content.schema'
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { GetListDto } from '../../admin/admin_core.dto'
import { response } from 'src/interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'
import { Favorite } from '@schema/user.favorite.schema';
import { Comment } from '@schema/articles.comment.schema'


@Injectable()
export class ArticlesClientService {
    private readonly imgUrl: string;
    constructor(
        @InjectModel(Tags.name) private tagsModel: Model<Tags>,
        @InjectModel(Config.name) private configModel: Model<Config>,
        @InjectModel(Articles.name) private contentModel: Model<Articles>,
        @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
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
        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean().exec()
        const formatList = this.formatArticleListData(list, lang)
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
        let configCategories = this.memoryStorageService.get('categories') // first get categories config from cache
        if (!configCategories) {
            const categories = await this.configModel.findOne({ key: 'categories' }).select('property -_id')
            configCategories = CommonMethods.getArrayObjectKey(categories?.property)
            this.memoryStorageService.set('categories', configCategories)
        }
        const isCategoryExisted = configCategories.includes(category)
        if (!isCategoryExisted) return { code: 1, messages: 'System error : Can not find this category in config' }
        query.categories = category
        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean().exec()
        const formatList = this.formatArticleListData(list, lang)
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

        const isTagExisted = await this.tagsModel.findOne({ _id: tagId }).lean().exec()
        if (!isTagExisted) return { code: 1, messages: 'System error : Can not find this tag' }
        const tagObj = isTagExisted.lang.find(item => Object.keys(item)[0] === lang);
        const tagName = tagObj ? Object.values(tagObj)[0] : null;
        const tags = { _id: isTagExisted._id, name: tagName }
        query.tags = tagId

        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean().exec()
        const formatList = this.formatArticleListData(list, lang, tagId)
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

        let configLang = this.memoryStorageService.get('languages')//cache first
        if (!configLang) {
            const lang = await this.configModel.findOne({ key: 'languages' }).select('property -_id')
            configLang = CommonMethods.getArrayObjectKey(lang?.property)
            this.memoryStorageService.set('languages', configLang)
        }
        //search all languages in name or introductions
        const orConditions = fields.flatMap(field => configLang.map(lang => ({ [`${field}.${lang}`]: regex })));

        const query: any = {
            status: 0,
            $or: orConditions
        }
        //if category not null
        if (category) { query.categories = category }
        const list = await this.contentModel.find(query).sort({ createdAt: -1, view: -1 }).skip(skip).limit(dto.entries).populate('tags').lean().exec()
        const formatList = this.formatArticleListData(list, lang)
        return {
            code: 0,
            data: {
                list: formatList,
                page: dto.page
            }
        };
    }

    /**
     * Get articleDes in Waterfall Flow
     * @param articleId 
     * @param ip 
     * @returns 
     */
    async articleDes(articleId: string, ip: string, userId: string): Promise<response> {
        try {
            //get article accumulate count 
            let accumulateView = this.memoryStorageService.get(`viewCount:${articleId}`) || 0
            //same ip same article daily limit once
            const isDailyLimit = this.memoryStorageService.get(`view:${articleId}:${ip}`)
            if (!isDailyLimit) {
                accumulateView += 1;
                this.memoryStorageService.set(`view:${articleId}:${ip}`, true, 60 * 60 * 24)
            }

            //reached accumulate limit update to db
            let view = 0
            const article = await this.contentModel.findOne({ _id: articleId })
            view = article ? article.view + accumulateView : view

            const count = 1
            if (accumulateView >= count) {
                if (article) {
                    article.view = article.view + count
                    const res = await article.save()
                    accumulateView = accumulateView - count
                }
            }
            //update accumulate cache
            this.memoryStorageService.set(`viewCount:${articleId}`, accumulateView)

            //get comment number
            let comment = 0
            const query = userId ? { commentId: articleId, $or: [{ status: 'public' }, { status: 'self', userId }] } : { commentId: articleId, status: 'public' }
            comment = await this.commentModel.countDocuments(query).exec();

            //find favorite relation
            let favorite = ""
            if (userId) {
                const doc = await this.favoriteModel.findOne({ userId, articleId }, { _id: 1 }).lean().exec();
                favorite = doc?._id?.toString() || "";
            }

            return { code: 0, messages: 'Success', data: { favorite, view, comment } }
        } catch (error) {
            return { code: 0, messages: error }

        }
    }

    /**
     * Get tag list
     * @param dto 
     * @param lang 
     * @param keyword 
     * @returns 
     */
    async tagsList(dto: GetListDto, lang = "en", keyword: string,): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const regex = new RegExp(keyword, 'i')
        if (!keyword) {
            const tagsList = await this.tagsModel.find().sort().skip(skip).limit(dto.entries).lean().exec()
            const formatTagsList = CommonMethods.tagsFormatByLang(tagsList, lang, '')
            return { code: 0, data: { list: formatTagsList, page: dto.page } }
        }

        let configLang = this.memoryStorageService.get('languages')//cache first
        if (!configLang) {
            const lang = await this.configModel.findOne({ key: 'languages' }).select('property -_id')
            configLang = CommonMethods.getArrayObjectKey(lang?.property)
            this.memoryStorageService.set('languages', configLang)
        }

        //search all languages in tags lang
        const orConditions = configLang.map(lang => ({ [`lang.${lang}`]: regex }))
        const query: any = { $or: orConditions }
        const tagsList = await this.tagsModel.find(query).sort().skip(skip).limit(dto.entries).lean().exec()
        const formatTagsList = CommonMethods.tagsFormatByLang(tagsList, lang, '')
        return { code: 0, data: { list: formatTagsList, page: dto.page } }
    }



    /**
     * Favorite operation
     * @param user 
     * @param articleId 
     * @returns 
     */
    async favoriteArticle(userId: string, articleId: string): Promise<response> {
        try {
            if (!articleId) return { code: 3, messages: "The content has been updated. Please refresh and try again." }
            const isArticleExisted = await this.contentModel.findOne({ _id: articleId, status: 0 }).lean().exec()
            if (!isArticleExisted) return { code: 3, messages: "The content has been updated. Please refresh and try again." }
            const relation = await this.favoriteModel.findOne({ articleId: articleId, userId: userId })
            if (relation) {
                await this.favoriteModel.deleteOne({ _id: relation._id });
                return { code: 0, messages: "Success", data: { status: "DELETE" } }
            } else {
                const created = new this.favoriteModel({ userId: userId, articleId: articleId }).save();
                return { code: 0, messages: "Success" }
            }
        } catch (error) {
            return { code: 3, messages: error }
        }
    }


    /**
     * Get user favorite article list
     * @param dto 
     * @param lang 
     * @param keyword 
     * @param category 
     * @param userId 
     */
    async favoriteArticleList(dto: GetListDto, lang: string, category: string | null, userId: string): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        if (category === 'null' || category === 'undefined') { category = null }
        const conditions: any[] = [
            { $match: { userId: userId } },
            { $addFields: { articleObjectId: { $toObjectId: '$articleId' } } },
            { $lookup: { from: 'articles', localField: 'articleObjectId', foreignField: '_id', as: 'articleDetails' } },
            { $unwind: '$articleDetails' },
            { $match: { 'articleDetails.status': 0, ...(category ? { 'articleDetails.categories': category } : {}) } },
            { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: dto.entries },
            {
                $project: {
                    _id: 1, userId: 1, createdAt: 1,
                    articleId: {
                        _id: '$articleDetails._id', name: '$articleDetails.name', introduction: '$articleDetails.introduction',
                        coverImg: '$articleDetails.coverImg', categories: '$articleDetails.categories', createdAt: '$articleDetails.createdAt'
                    }
                }
            }];
        const articleList = await this.favoriteModel.aggregate(conditions)
        const formatArticleList = articleList.filter(item => item.articleId).map((item) => {
            const { articleId, ...rest } = item
            return { ...rest, article: this.formatMinArticleData(item.articleId, lang) }
        })
        return { code: 0, data: { list: formatArticleList } }
    }


    /**
     * Get articleDes in page
     * @param dto 
     * @param id 
     * @param userId 
     * @param lang 
     * @returns 
     */
    async articlePage(dto: GetListDto, id: string, userId: string, lang: string = 'en'): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        if (!id) return { code: 3, messages: 'The content has been updated. Please refresh and try again.' }
        const article = await this.contentModel.findOne({ _id: id }).populate('tags').lean().exec()
        if (!article) return { code: 3, messages: 'The content has been updated. Please refresh and try again.' }
        const query = userId ? { commentId: id, $or: [{ status: 'public' }, { status: 'self', userId }] } : { commentId: id, status: 'public' }
        const [favorite, comment] = await Promise.all([
            this.favoriteModel.findOne({ articleId: id, userId: userId }, '_id').lean().exec(),
            this.commentModel.countDocuments(query).exec()
        ])
        const formatArticle = this.formatArticleData(article, lang)
        const view = this.memoryStorageService.get(`viewCount:${id}`) || 0
        formatArticle.view = article.view + view
        return { code: 0, data: { article: formatArticle, comment, favorite } }
    }


    /**
     * Get Article list through comment relation
     * @param dto 
     * @param userId 
     * @param lang 
     * @returns 
     */
    async commentArticleList(dto: GetListDto, userId: string, lang: string = "en"): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const conditions: any[] = [
            { $match: { userId: userId, delete: false } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$articleId', latestComment: { $first: '$content' }, commentCount: { $sum: 1 }, lastCommentTime: { $first: '$createdAt' } } },
            { $sort: { lastCommentTime: -1 } },
            { $skip: skip },
            { $limit: dto.entries },
            { $addFields: { articleObjectId: { $toObjectId: '$_id' } } },
            { $lookup: { from: 'articles', localField: 'articleObjectId', foreignField: '_id', as: 'articleDetails' } },
            { $unwind: '$articleDetails' },
            {
                $project: {
                    _id: 1, userId: 1, content: '$latestComment', commentCount: 1, createdAt: '$lastCommentTime',
                    articleId: {
                        _id: '$articleDetails._id', name: '$articleDetails.name', introduction: '$articleDetails.introduction',
                        coverImg: '$articleDetails.coverImg', categories: '$articleDetails.categories', createdAt: '$articleDetails.createdAt'
                    }
                }
            }]
        const comment = await this.commentModel.aggregate(conditions)
        const formatArticleList = comment.map((item) => {
            const { articleId, ...rest } = item
            return {
                ...rest,
                createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                article: this.formatMinArticleData(item.articleId, lang),
            }
        })
        return { code: 0, data: { list: formatArticleList } }
    }


    /**
     * Common function:format article list
     * @param list 
     * @param lang 
     * @returns 
     */
    formatArticleListData(list: any[], lang: string, tagId: string = "") {
        return list.map(item => {
            const { name, introduction, guides, downloads, ...rest } = item
            const _guides = item.guides[lang] ? item.guides[lang] : item.guides['en']
            const _downloads = item.downloads[lang] ? item.downloads[lang] : item.introduction['en']
            return {
                ...rest,
                tags: CommonMethods.tagsFormatByLang(item.tags, lang, tagId),
                coverImg: this.imgUrl + item.coverImg,
                title: item.name[lang] ? item.name[lang] : item.name['en'],
                des: item.introduction[lang] ? item.introduction[lang] : item.introduction['en'],
                createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                files: _guides.concat(_downloads)
            }
        });
    }

    /**
     * Common function:format article
     * @param item 
     * @param lang 
     * @param tagId 
     */
    formatArticleData(item: any, lang: string, tagId: string = "") {
        const _guides = item.guides[lang] ? item.guides[lang] : item.guides['en']
        const _downloads = item.downloads[lang] ? item.downloads[lang] : item.introduction['en']
        item.title = item.name[lang] ? item.name[lang] : item.name['en']
        item.tags = CommonMethods.tagsFormatByLang(item.tags, lang, tagId)
        item.des = item.introduction[lang] ? item.introduction[lang] : item.introduction['en']
        item.createdAt = dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
        item.files = _guides.concat(_downloads)
        item.coverImg = this.imgUrl + item.coverImg
        const keys = ['name', 'introduction', 'guides', 'downloads']
        keys.forEach(key => delete item[key]);
        return item
    }

    /**
     * Common function:format minArticle
     * @param item 
     * @param lang 
     */
    formatMinArticleData(item: any, lang: string) {
        item.des = item.introduction[lang] ? item.introduction[lang] : item.introduction['en']
        item.title = item.name[lang] ? item.name[lang] : item.name['en']
        item.createdAt = dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
        item.coverImg = this.imgUrl + item.coverImg
        delete item.name;
        delete item.introduction;
        return item
    }
}