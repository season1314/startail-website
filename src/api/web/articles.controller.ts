import { Controller, Get, Query, Param, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { GetHomeArticlesService } from './application/get-home-articles.service';

@Controller('/api/v1/web')
export class ArticlesController {
    constructor(
        private readonly getHomeArticlesService: GetHomeArticlesService
    ) { }

    @Get('articles')
    async findAll(@Query('page', new ParseIntPipe()) page: number = 1) {
        return await this.getHomeArticlesService.execute(page);
    }

    @Get('articles/category/:category')
    async findAllByCategory(@Param('category') category: string, @Query('page', new ParseIntPipe()) page: number = 1
    ) {
        return await this.getHomeArticlesService.category(page, 'en', category)
    }

    @Get('articles/tag/:tag')
    async findAllByTags(@Param('tag') tagId: string, @Query('page', new ParseIntPipe()) page: number = 1
    ) {
        return await this.getHomeArticlesService.tags(page, 'en', tagId)
    }
}