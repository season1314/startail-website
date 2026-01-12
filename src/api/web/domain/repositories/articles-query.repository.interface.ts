
import { ArticlesModel } from '../models/articles.model';

export interface IArticlesQueryRepository {
    getPublishedList(page: number, limit: number): Promise<ArticlesModel[]>;
    categoryPublishedList(page: number, limit: number, category: string): Promise<ArticlesModel[]>;
    tagsPublishedList(page: number, limit: number, tagId: string): Promise<ArticlesModel[]>
    searchPublishedList(page: number, limit: number, keyword: string, category: string, langs: string[]): Promise<ArticlesModel[]>
}

