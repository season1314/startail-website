import { Injectable, BadRequestException, UsePipes } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetListDto } from '../admin_core.dto';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import type { response } from '../../interface'
import { User } from '../../schema/user.schema'
import { MemoryStorageService } from '../../memory-storage.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly memoryStorageService: MemoryStorageService,
    ) { }


    /**
     * Get user list
     * @param dto 
     */
    async userList(dto: GetListDto): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = {};
        if (dto.keyword) {
            query.$or = [
                { nickname: { $regex: dto.keyword, $options: 'i' } },
                { email: { $regex: dto.keyword, $options: 'i' } },
            ];
        }
        const [list, total] = await Promise.all([
            this.userModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(dto.entries).lean().exec(),
            this.userModel.find(query).countDocuments()
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
                totalPages: Math.ceil(total / dto.entries),
            }
        };
    }

    /**
     * SwitchUserStatus
     * @param userId 
     * @returns 
     */
    async switchUserStatus(userId: string | null | undefined): Promise<response> {
        try {
            if (!userId) return { code: 1, messages: 'userId is not existed' }
            if (userId == "697b398f9fdef03f8db5338f") return { code: 1, messages: 'special user cannot baned' }
            const user = await this.userModel.findById(userId)
            if (!user) return { code: 1, messages: 'user is not existed' }
            user.status = user.status == 0 ? 1 : 0
            await user.save()
            if (user.status != 0) {
                this.memoryStorageService.set(`blacklist:${userId}`, true)
            } else {
                this.memoryStorageService.delete(`blacklist:${userId}`)
            }
            return { code: 0, messages: 'update status successful' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }
}