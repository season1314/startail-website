import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from '../../schema/articles.tags.schema'
import { Config } from '../../schema/config.common.schema'
import { Articles } from '../../schema/articles.content.schema'
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { GetListDto } from '../../admin/admin_core.dto'
import { response } from 'src/admin/admin_interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'



@Injectable()
export class ConfigClientService {
    constructor(
        @InjectModel(Config.name) private configModel: Model<Config>,
        private readonly configService: ConfigService,
        private readonly memoryStorageService: MemoryStorageService,


    ) { }
    /**
     * Get config
     * @param lang 
     * @returns 
     */
    async getConfigCategory(lang: string = 'en'): Promise<response> {
        let categories = this.memoryStorageService.get(`${lang}_categories`)
        if (categories) return { code: 0, data: categories }
        const rawData = await this.configModel.findOne({ key: 'categories' })
        if (!rawData?.property) return { code: 1, messages: 'Can not found property in categories config' }
        categories = CommonMethods.configFormatByLang(rawData?.property, 'en')
        this.memoryStorageService.set(`${lang}_categories`, categories)
        return { code: 0, data: categories }
    }
}