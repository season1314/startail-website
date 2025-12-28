import { Injectable } from '@nestjs/common';
import type { response } from '../admin_interface'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from './articles.tags.schema'
import { Config } from '../config/config.common.schema'
import dayjs from 'dayjs';
import { GetListDto } from '../admin_core.dto';



@Injectable()
export class ArticlesService {
    constructor(@InjectModel(Tags.name) private tagsModel: Model<Tags>, @InjectModel(Config.name) private configModel: Model<Config>) { }

    /**
     * Get administrator list
     * @param dto 
     * @returns 
     */
    async getTags(dto: GetListDto): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = {};
        if (dto.keyword) {
            query.$or = [
                { name: { $regex: dto.keyword, $options: 'i' } },
            ];
        }
        const [list, total, lang] = await Promise.all([
            this.tagsModel.find().sort({ createdAt: -1 }).skip(skip).limit(dto.entries).lean(),
            this.tagsModel.countDocuments(),
            this.configModel.findOne({ key: 'languages' }).select('property -_id')
        ])
        const formatList = list.map(item => ({
            ...item,
            createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }));
        return {
            code: 0,
            data: {
              list: formatList,
              total,
              page: dto.page,
              pageSize: dto.entries,
              lang:lang?.property,
              totalPages: Math.ceil(total / dto.entries),
            }
          };
    }
}
