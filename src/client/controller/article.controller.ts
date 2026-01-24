import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { TokenToUser } from '../../common.decorator'
import type { Request } from 'express'
import { JwtService } from '@nestjs/jwt';


@Controller('article')
export class ArticleController {
    constructor(
        private readonly articlesClientService: ArticlesClientService,
        private readonly configClientService: ConfigClientService,
        private jwtService: JwtService
    ) {

    }


    @Get('/favorite/:articleId')
    async favorite(@TokenToUser() user: any, @Param('articleId') articleId: string) {
        const userId = user.sub;
        if (userId) {
            return await this.articlesClientService.favoriteArticle(userId, articleId)
        }
        else { return { code: 3, messages: 'Please log in to continue.' } }
    }

    @Get('/des/:articleId')
    async articleDes(@TokenToUser() user: any, @Param('articleId') articleId: string, @Req() req: Request) {
        const userId = user.sub;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip) { ip = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim(); }
        else { ip = req.socket.remoteAddress || undefined }
        if (!ip) return { code: 0, messages: 'IP is not existed.' }
        return await this.articlesClientService.articleDes(articleId, ip, userId)
    }
}