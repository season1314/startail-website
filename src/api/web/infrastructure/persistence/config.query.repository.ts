import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Config } from '@schema/config.common.schema';
import { IConfigsQueryRepository } from '@domain/repositories/configs-query.repository.interface';
import { ConfigsModel } from '@domain/models/configs.model';

@Injectable()
export class ConfigsQueryRepository implements IConfigsQueryRepository {
    constructor(
        @InjectModel(Config.name) private readonly configModel: Model<Config>,
    ) { }


    async getConfigItem(key: string) {
        const rawData = await this.configModel
            .findOne({ key: key })
            .lean()
            .exec();
        return new ConfigsModel(rawData);
    }
}