
import { ArticlesModel } from '../models/articles.model';

export interface IArticlesQueryRepository {
    getPublishedList(page: number, limit: number): Promise<ArticlesModel[]>;
    categoryPublishedList(page: number, limit: number, category: string): Promise<ArticlesModel[]>;
    tagsPublishedList(page: number, limit: number, tagId: string): Promise<ArticlesModel[]>
}

