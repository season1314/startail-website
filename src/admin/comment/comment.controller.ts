import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Render,
    Res,
    Req,
    Query,
    Session,
    Delete,
    HttpException,
    HttpStatus,
    Param
} from '@nestjs/common';
import { FormValidationPipe } from '../../middleware.pipe.guard';
import type { Response, Request } from 'express';
import { GetListDto } from '../admin_core.dto';
import { error } from 'console';
import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { CommentService } from '../comment/comment.service'

@Controller()
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    /**
    * Render Comment page
    */
    @Get()
    @Render('backend/articles/comment')
    index() {
        return {
            title: 'Comments',
            bc: [
                { url: '/admin', name: 'Dashboard' },
                { url: '/articles/content', name: 'Articles' },
                { url: '#', name: 'Comments' },
            ],
        };
    }

    /**
      * Get comment list
      * 
      * HTTP Method:Get
      * Request Param:
      * -Id: commentId or article Id
      * Request Query:
      * -Page:page number
      * 
      * Description:
      * 
      * Get comment list base parent id
      * Each comment count children comment
      * 
      */
    @Get('list/:id')
    async getCommentList(@Param('id') Id: string, @Query('page') page = 1) {
        return await this.commentService.commentList({ page, entries: 20 }, Id == "0" ? '' : Id)
    }

    /**
      * Update comment list
      * 
      * HTTP Method:Put
      * Request Body:
      * -Id: commentId
      * -Content:comment content
      * -Status：comment Status public or self
      * 
      * 
      * Description:
      * Verify the comment existed
      * Update comment by parameter
      * 
      */
    @Put()
    async updateComment(@Body('id') Id: string, @Body('content') content: string, @Body('status') status: string) {
        return await this.commentService.updateComment(Id, content, status)
    }

    /**
    * Create comment
    * 
    * HTTP Method:Put
    * Request Body:
    * -Id: parent commentId
    * -Content:comment content
    * 
    * 
    * Description:
    * Verify the comment existed
    * Create comment
    * Switch Parent comment status to public
    * 
    */

    @Post()
    async replyComment(@Body('commentId') commentId: string, @Body('content') content: string) {
        return await this.commentService.createComment(commentId, content)
    }

    /**
  * Delete comment
  * 
  * HTTP Method:Delete
  * Request Query:
  * -CommentId: commentId
  * 
  * 
  * Description:
  * Verify the comment existed
  * Check the comment has Children
  * Has Children switch comment delete to true for fake delete
  * Has not delete comment directly
  */
    @Delete()
    async deleteComment(@Query('commentId') commentId: string) {
        return await this.commentService.deleteComment(commentId)
    }
}