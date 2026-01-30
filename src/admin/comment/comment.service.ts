import { Injectable, BadRequestException, UsePipes } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetListDto } from '../admin_core.dto';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import type { response } from '../../interface'
import { Comment } from '../../schema/articles.comment.schema'
import { MemoryStorageService } from '../../memory-storage.service';
import { CommentStatus } from '../../schema/articles.comment.schema'

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        private readonly memoryStorageService: MemoryStorageService,
    ) { }


    /**
     * Get comment list
     * @param articleId 
     * @param commentId 
     * @param dto 
     * @returns 
     */
    async commentList(dto: GetListDto, commentId: string,): Promise<response> {
        const id = commentId && commentId != 'null' && commentId != 'undefined' ? commentId : ''
        const skip = (dto.page - 1) * dto.entries;
        const query: any = {};
        if (id) {
            query.commentId = id;
        }

        const [list, total] = await Promise.all([
            this.commentModel.find(query).sort({ createdAt: -1 }).populate('userId', '_id nickname email').skip(skip).limit(dto.entries).lean().exec(),
            this.commentModel.find(query).countDocuments()
        ])
        const formatList = await Promise.all(
            list.map(async item => {
                const count = await this.commentModel.countDocuments({
                    commentId: item._id,
                });
                return {
                    ...item,
                    id: item._id,
                    createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
                    commentCount: count,
                };
            }))
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
     * Update comment
     * @param commentId 
     * @param content 
     * @param status 
     * @returns 
     */
    async updateComment(commentId: string, content: string, status: string): Promise<response> {
        try {
            if (!commentId) return { code: 1, messages: 'commentId cannot be null' }
            const comment = await this.commentModel.findOne({ _id: commentId })
            if (!comment) return { code: 1, messages: 'comment is not existed' }
            if (content) {
                comment.content = content
            }
            if (status && status == "public") {
                comment.status = CommentStatus.public
            }
            if (status && status == "self") {
                comment.status = CommentStatus.self
            }
            const res = await comment.save()
            return { code: 0, data: res, messages: 'successful update' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }



    /**
     * Delete comment
     * @param commentId 
     * @returns 
     */
    async deleteComment(commentId: string): Promise<response> {
        try {
            if (!commentId) return { code: 1, messages: 'commentId cannot be null' }
            const [comment, hasChild] = await Promise.all([
                this.commentModel.findById(commentId),
                this.commentModel.findOne({ commentId: commentId })
            ])
            if (!comment) return { code: 1, messages: 'comment is not existed' }
            if (hasChild) { comment.delete = true; await comment.save() }
            else { await this.commentModel.deleteOne({ _id: commentId }) }
            return { code: 0, messages: 'successful delete comment' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Create new comment
     * @param commentId 
     * @param status 
     * @param content 
     * @returns 
     */
    async createComment(commentId: string, content: string): Promise<response> {
        try {
            if (!commentId) return { code: 1, messages: 'commentId cannot be null' }
            if (!content) return { code: 2, messages: [{ reply: 'reply cannot be empty' }] }
            const comment = await this.commentModel.findById(commentId)
            if (!comment) return { code: 1, messages: 'comment is not existed' }
            const newComment = await this.commentModel.create({
                userId: '697b398f9fdef03f8db5338f',
                articleId: comment.articleId,
                commentId: commentId,
                content: content,
                status: CommentStatus.public,
            });
            if (comment.status !== 'public') {
                comment.status = CommentStatus.public
                await comment.save()
            }
            return { code: 0, messages: 'successful created new comment' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

}