import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from '../../schema/articles.tags.schema'
import { Config } from '../../schema/config.common.schema'
import { Articles } from '../../schema/articles.content.schema'
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { GetListDto } from '../../admin/admin_core.dto'
import { response } from 'src/interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'
import { Comment } from '../../schema/articles.comment.schema'
import { addAbortListener } from 'events';



@Injectable()
export class CommentClientService {
    constructor(
        @InjectModel(Config.name) private configModel: Model<Config>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        private readonly configService: ConfigService,
        private readonly memoryStorageService: MemoryStorageService,
    ) { }
    /**
     * Get comment list
     * @param dto 
     * @param articleId 
     * @param userId 
     * @param commentId 
     * @returns 
     */
    async getArticleComment(dto: GetListDto, articleId: string, userId: string, commentId: string): Promise<response> {
        let id = commentId ? commentId : articleId
        const skip = (dto.page - 1) * dto.entries;
        const query = userId ? { commentId: articleId, $or: [{ status: 'public' }, { status: 'self', userId }] } : { commentId: articleId, status: 'public' }
        const [commentList, commentTotal] = await Promise.all([
            this.commentModel.find(query).sort({ status: -1, createdAt: -1 }).populate('userId', '_id nickname avatar').skip(skip).limit(dto.entries).lean().exec(),
            this.commentModel.countDocuments(query).exec()]
        )
        const listWithReplyInfo = await Promise.all(
            commentList.map(async (item) => {
                const replyCount = await this.commentModel.countDocuments({
                    commentId: item._id,
                    status: 'public'
                });
                return {
                    ...item,
                    self: (item.userId as any)._id.toString() == userId ? true : false,
                    createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                    replyCount: replyCount,
                    hasReplies: replyCount > 0
                };
            })
        )

        return { code: 0, data: { commentList: listWithReplyInfo, userId: userId, commentTotal } }
    }


    /**
     * Create comment
     * @param articleId 
     * @param commentId 
     * @param userId 
     * @param content 
     * @param status 
     * @returns 
     */
    async createComment(articleId: string, commentId: string, userId: string, content: string, status: string): Promise<response> {
        if (!articleId) return { code: 3, messages: 'The content has been updated. Please refresh and try again.' }
        if (!userId) return { code: 3, messages: 'Please log in to continue.' }
        if (!content) return { code: 1, messages: 'Please enter a comment.' }
        let id = commentId ? commentId : articleId
        try {
            const isDuplicate = this.memoryStorageService.get(`comment:${id}user:${userId}`)
            if (isDuplicate) return { code: 1, messages: 'Posting comment...' }
            this.memoryStorageService.set(`comment:${id}user:${userId}`, true)
            const res = new this.commentModel({
                articleId,
                content,
                userId,
                status: 'self',
                commentId: id
            }).save()
            this.memoryStorageService.delete(`comment:${id}user:${userId}`)
            return { code: 0, messages: 'Post comment successful', data: { comment: res } }
        } catch (error) {
            this.memoryStorageService.delete(`comment:${id}user:${userId}`)
            return { code: 3, messages: error }
        }
    }

    /**
     * Update comment
     * @param id 
     * @param content 
     * @param userId 
     * @returns 
     */
    async updateComment(id: string, content: string, userId: string): Promise<response> {
        if (!id) return { code: 1, messages: 'This comment Id is not existed' }
        if (!content) return { code: 1, messages: 'Please enter a comment.' }
        const isDuplicate = this.memoryStorageService.get(`comment:${id}user:${userId}`)
        if (isDuplicate) return { code: 1, messages: 'Posting comment...' }
        try {
            this.memoryStorageService.set(`comment:${id}user:${userId}`, true)
            const comment = await this.commentModel.findOne({ _id: id, userId: userId })
            if (!comment) {
                this.memoryStorageService.delete(`comment:${id}user:${userId}`)
                return { code: 3, messages: 'This comment has been updated. Please refresh and try again.' }
            }
            comment.content = content
            const res = await comment.save()
            return { code: 0, messages: 'Update comment successful', data: { comment: res } }
        } catch (error) {
            this.memoryStorageService.delete(`comment:${id}user:${userId}`)
            return { code: 3, messages: error }
        }
    }


    /**
     * Delete comment
     * @param id 
     * @param userId 
     * @returns 
     */
    async deleteComment(id: string, userId: string): Promise<response> {
        if (!id) return { code: 3, messages: 'The content has been updated. Please refresh and try again.' }
        if (!userId) return { code: 3, messages: 'Please log in to continue.' }
        try {
            const comment = await this.commentModel.findOne({ _id: id, userId: userId })
            if (!comment) {
                return { code: 3, messages: 'This comment has been updated. Please refresh and try again.' }
            }
            if (comment.status == 'public') {
                comment.delete = true;
                await comment.save()
                return { code: 0, messages: 'Delete comment successful', data: { type: 'update' } }
            }
            else {
                await this.commentModel.deleteOne({ _id: id, userId: userId });
                return { code: 0, messages: 'Delete comment successful', data: { type: 'delete' } }

            }
        } catch (error) {
            return { code: 1, messages: error }

        }
    }

    /**
     * Get comment list
     * @param dto 
     * @param articleId 
     * @param userId 
     */
    async commentList(dto: GetListDto, id: string, userId: string): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        if (!id) return { code: 3, messages: 'The content has been updated. Please refresh and try again.' }
        const query = userId ? { commentId: id, $or: [{ status: 'public' }, { status: 'self', userId }] } : { commentId: id, status: 'public' }
        const commentList = await this.commentModel.find(query).sort({ status: -1, createdAt: -1 }).populate('userId', '_id nickname avatar').skip(skip).limit(dto.entries).lean().exec()
        const listWithReplyInfo = await Promise.all(
            commentList.map(async (item) => {
                const replyCount = await this.commentModel.countDocuments({
                    commentId: item._id,
                    status: 'public'
                });
                return {
                    ...item,
                    self: (item.userId as any)._id.toString() == userId ? true : false,
                    createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                    replyCount: replyCount,
                    hasReplies: replyCount > 0
                };
            })
        )
        return { code: 0, data: { commentList: listWithReplyInfo } }
    }
}