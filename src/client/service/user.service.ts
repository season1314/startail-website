import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GetListDto } from '../../admin/admin_core.dto'
import { response } from 'src/admin/admin_interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'
import { EmailService } from '../../mail.service';


@Injectable()
export class userClientService {
    constructor(
        private readonly configService: ConfigService,
        private readonly memoryStorageService: MemoryStorageService,
        private readonly emailService: EmailService


    ) { }

    /**
     * Get articles list
     * @param dto 
     * @returns 
     */
    async getArticleList(dto: GetListDto, lang: string = 'en'): Promise<response> {
             // const success = await this.emailService.sendEmail(
        //     'haoqingshuang@gmail.com',
        //     'NestJS Test Email',
        //     'Hello! This is a test email.',
        //     '<b>Hello! This is a test email.</b>'
        // );
        
        return {code:0 ,messages:''}
    }
}