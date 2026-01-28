import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { TokenToUser } from '../../common.decorator'
import type { Request } from 'express'
import { JwtService } from '@nestjs/jwt';
import { CommentClientService } from '../service/article.comment.service'


@Controller('article')
export class ArticleController {
    constructor(
        private readonly articlesClientService: ArticlesClientService,
        private readonly configClientService: ConfigClientService,
        private readonly commentClientService: CommentClientService,
        private jwtService: JwtService
    ) {
    }


    /** 
     * Favorite Articles
     *
     * HTTP Method: GET
     * Request param:
     * - ArticleId: articleId
     * Request TokenToUser:
     * - User: user data via token
     * 
     * Description:
     * - Verify user existed
     * - Verify article existed
     * - Find user favorite relation
     * - Relation existed to delete, no existed to created  
     */

    @Get('/favorite/:articleId')
    async favorite(@TokenToUser() user: any, @Param('articleId') articleId: string) {
        const userId = user.sub;
        if (userId) {
            return await this.articlesClientService.favoriteArticle(userId, articleId)
        }
        else { return { code: 3, messages: 'Please log in to continue.' } }
    }



    /** 
     * Get article details in waterfall
     *
     * HTTP Method: GET
     * Request param:
     * - ArticleId: articleId
     * Request TokenToUser:
     * - User: user data via token
     * 
     * Description:
     * - User ip address to add article view
     * - get article details
     * - get favorite status by userId
     * - get comment count  
     */
    @Get('/des/:articleId')
    async articleDes(@TokenToUser() user: any, @Param('articleId') articleId: string, @Req() req: Request) {
        const userId = user.sub;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip) { ip = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim(); }
        else { ip = req.socket.remoteAddress || undefined }
        if (!ip) return { code: 0, messages: 'IP is not existed.' }
        const res = await this.articlesClientService.articleDes(articleId, ip, userId)
        if (res.code == 0) { res.data.user = user }
        return res
    }


    /** 
     * Create comment
     *
     * HTTP Method: Post
     * Request Body:
     * - Content: comment content
     * - articleId：article id
     * - commentId：parent comment id
     * Request TokenToUser:
     * - User: user data via token
     * 
     * Description:
     * - Verify user, content and article id posted  
     * - Check cache to prevent duplicate crate
     * - Create comment status self
     * - Create success and delete cache
     */
    @Post('comment')
    async createComment(@TokenToUser() user: any, @Body('articleId') articleId: string, @Body('content') content: string, @Body('commentId') commentId: string = "") {
        const userId = user.sub;
        if (userId) { return await this.commentClientService.createComment(articleId, commentId, userId, content, 'self') }
        else { return { code: 3, messages: 'Please log in to continue.' } }
    }



    /** 
     * Get comment list
     *
     * HTTP Method: Get
     * Request Query:
     * - Page: page
     * - articleId*：article id
     * - commentId：parent comment id
     * Request TokenToUser:
     * - User: user data via token
     * 
     * Description:
     * - Get comment base user exited or no 
     * - Without user get status as public
     * - With user get status self first than public
     */
    @Get('comment')
    async getComment(@TokenToUser() user: any, @Query('page') page = 1, @Query('articleId') articleId: string, @Query('commentId') commentId: string = "") {
        const userId = user.id || ""
        return await this.commentClientService.getArticleComment({ page, entries: 3 }, articleId, userId, commentId)
    }


    /** 
    * Delete comment
    *
    * HTTP Method: delete
    * Request Query:
    * - commentId：parent comment id
    * Request TokenToUser:
    * - User: user data via token
    * 
    * Description:
    * - Verify comment existed
    * - Comment status is public,update to hide mode
    * - Comment status is self,delete comment
    * - Return delete type as update or delete 
    */
    @Delete('comment')
    async deleteComment(@TokenToUser() user: any, @Query('commentId') commentId: string) {
        const userId = user.id || ""
        return await this.commentClientService.deleteComment(commentId, userId)
    }
}