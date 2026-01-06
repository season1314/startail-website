
import { ArticlesModel } from '../models/articles.model';

export interface IArticlesQueryRepository {
    getPublishedList(page: number, limit: number): Promise<ArticlesModel[]>;
}