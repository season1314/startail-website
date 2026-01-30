import { Injectable, BadRequestException, UsePipes } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetListDto } from '../admin_core.dto';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import type { response } from '../../interface'
import { User } from '../../schema/user.schema'
import { MemoryStorageService } from '../../memory-storage.service';
import { Articles } from '@schema/articles.content.schema';
import { Comment } from '@schema/articles.comment.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Articles.name) private articlesModel: Model<Articles>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        private readonly memoryStorageService: MemoryStorageService,
    ) { }

    /**
     * Get user list
     * @param dto 
     */
    async accumulateData(): Promise<any[]> {
        const [users, articles, comments, views] = await Promise.all([
            this.userModel.countDocuments(),
            this.articlesModel.countDocuments(),
            this.commentModel.countDocuments(),
            this.articlesModel.aggregate([{ $match: { status: 0 } }, { $group: { _id: null, totalViews: { $sum: '$view' } } }])
        ])
        return [users, articles, comments, views[0]?.totalViews ?? 0]
    }
}