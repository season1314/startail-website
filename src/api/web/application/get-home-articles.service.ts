import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IArticlesQueryRepository } from '../domain/repositories/articles-query.repository.interface';
import type { IConfigsQueryRepository } from '../domain/repositories/configs-query.repository.interface';
import type { ITagsQueryRepository } from '../domain/repositories/tags-query.repository.interface'

@Injectable()
export class GetHomeArticlesService {
  constructor(
    private readonly configService: ConfigService,

    @Inject('IArticlesQueryRepository')
    private readonly articleQuery: IArticlesQueryRepository,

    @Inject('IConfigsQueryRepository')
    private readonly configQuery: IConfigsQueryRepository,

    @Inject('ITagsQueryRepository')
    private readonly tagQuery: ITagsQueryRepository
  ) { }


  /**
   * Home page get all articles
   * @param page 
   * @param lang 
   * @returns 
   */
  async execute(page: number, lang: string = 'en') {
    try {
      const limit = 20;
      const cdnBase = this.configService.get<string>('IMG_URL') || '';
      const articles = await this.articleQuery.getPublishedList(page, limit);
      const articlesList = articles.map(article => article.toArticlesDto(lang, cdnBase));;
      return { code: 0, data: articlesList }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * Category page get all articles
   * @param page 
   * @param lang 
   * @param category 
   * @returns 
   */
  async category(page: number, lang: string = 'en', category: string) {
    try {
      if (!category) {
        return { code: 1, messages: `Category can not be null` }
      }
      const limit = 20
      const cdnBase = this.configService.get<string>('IMG_URL') || '';
      const configs = await this.configQuery.getConfigItem('categories')
      const keys = configs.toConfigObjectKeys()
      if (!keys.includes(category)) {
        return { code: 1, messages: `Category:"${category}" not existed` }
      }
      const articles = await this.articleQuery.categoryPublishedList(page, limit, category);
      const articlesList = articles.map(article => article.toArticlesDto(lang, cdnBase));
      return { code: 0, data: articlesList }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
 * Category page get all articles
 * @param page 
 * @param lang 
 * @param category 
 * @returns 
 */
  async tags(page: number, lang: string = 'en', tagId: string) {
    try {
      if (!tagId) {
        return { code: 1, messages: `tagId can not be null` }
      }
      const limit = 20
      const cdnBase = this.configService.get<string>('IMG_URL') || '';
      const tags = await this.tagQuery.getTagItem(tagId)
      const keys = tags.toTagsDto()
      if (!keys) { return { code: 1, messages: `This tag is not existed` } }
      const articles = await this.articleQuery.tagsPublishedList(page, limit, tagId)
      const articlesList = articles.map(article => article.toArticlesDto(lang, cdnBase));
      return { code: 0, data: articlesList }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }
}