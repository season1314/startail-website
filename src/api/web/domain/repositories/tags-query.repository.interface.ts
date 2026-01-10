
import { TagsModel } from '../models/tags.model';

export interface ITagsQueryRepository {
    getTagItem(key:string): Promise<TagsModel>;
}