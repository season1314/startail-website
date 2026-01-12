import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IArticlesQueryRepository } from '../domain/repositories/articles-query.repository.interface';
import type { IConfigsQueryRepository } from '../domain/repositories/configs-query.repository.interface';
import type { ITagsQueryRepository } from '../domain/repositories/tags-query.repository.interface'

@Injectable()
export class OptPropertiesSearchService {
    constructor(
        private readonly configService: ConfigService,

        @Inject('IArticlesQueryRepository')
        private readonly articleQuery: IArticlesQueryRepository,

        @Inject('IConfigsQueryRepository')
        private readonly configQuery: IConfigsQueryRepository,

        @Inject('ITagsQueryRepository')
        private readonly tagQuery: ITagsQueryRepository
    ) { }



    async searchArticle(page: number, lang: string = 'en', category: string, keyword: string) {
        try {
            const limit = 20
            const cleanKeyword = keyword ? keyword.trim() : "";
            const cdnBase = this.configService.get<string>('IMG_URL') || '';
            if (category) {
                const configs = await this.configQuery.getConfigItem('categories')
                const keys = configs.toConfigObjectKeys()
                if (!keys.includes(category)) {
                    return { code: 1, messages: `Category:"${category}" not existed` }
                }
            }
            const languages = await this.configQuery.getConfigItem('languages')
            const langs = languages.toConfigObjectKeys()
            const articles = await this.articleQuery.searchPublishedList(page, limit, keyword, category, langs);
            const articlesList = articles.map(article => article.toArticlesDto(lang, cdnBase));
            return { code: 0, data: articlesList }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }
}