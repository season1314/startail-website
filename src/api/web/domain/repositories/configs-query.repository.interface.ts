
import { ConfigsModel } from '../models/configs.model';

export interface IConfigsQueryRepository {
    getConfigItem(key:string): Promise<ConfigsModel>;
}