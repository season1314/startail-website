import { Controller, Get, Query, Param, ParseIntPipe, HttpStatus, HttpCode, DefaultValuePipe } from '@nestjs/common';
import { OptPropertiesSearchService } from './application/opt-properties-search.service'


@Controller('/api/v1/web')
export class SearchController {
    constructor(
        private readonly optPropertiesSearchService: OptPropertiesSearchService
    ) { }

    @Get('search/:type')
    async findAll(
        @Param('type') type: string | null | undefined,
        @Query('page', new ParseIntPipe()) page: number = 1,
        @Query('keyword', new DefaultValuePipe('')) keyword: string,
        @Query('category', new DefaultValuePipe('')) category: string,
    ) {
        if (category == "undefined") { category = '' }
        return await this.optPropertiesSearchService.searchArticle(page, 'en', category, keyword);
    }
}