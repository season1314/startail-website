import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { EmailService } from '../../mail.service';


@Controller()
export class HomeController {
    constructor(
        private readonly articlesClientService: ArticlesClientService, 
        private readonly configClientService: ConfigClientService, 
        private readonly emailService: EmailService
    ) { }
    /**
     *  Render home page
     */
    @Get('/')
    // @Render('backend/articles/tags')
    async index() {
        const articleList = await this.articlesClientService.getArticleList({ page: 1, entries: 20 })
        const categories = await this.configClientService.getConfigCategory()
        return {
            title: 'home',
            articleList: articleList.data,
            categories: categories.data
        };
    }
}