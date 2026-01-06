import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IArticlesQueryRepository } from '../domain/repositories/articles-query.repository.interface';
import type { IConfigsQueryRepository } from '../domain/repositories/configs-query.repository.interface';

@Injectable()
export class GetHomeArticlesService {
  constructor(
    @Inject('IArticlesQueryRepository')
    private readonly articleQuery: IArticlesQueryRepository,

    private readonly configService: ConfigService,

    @Inject('IConfigsQueryRepository')
    private readonly configQuery: IConfigsQueryRepository
  ) { }

  async execute(page: number, lang: string = 'en') {
    const limit = 20;
    const cdnBase = this.configService.get<string>('IMG_URL') || '';
    const articles = await this.articleQuery.getPublishedList(page, limit);
    const menu = await this.configQuery.getConfigItem('categories')
    const articlesList = articles.map(article => article.toArticlesDto(lang, cdnBase));
    const menuList = menu.toConfigDto(lang);
    return { articlesList, menuList }
  }
}