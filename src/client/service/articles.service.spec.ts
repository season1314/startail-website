import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ArticlesClientService } from './article.service';
import { Tags } from '../../schema/articles.tags.schema';
import { Config } from '../../schema/config.common.schema';
import { Articles } from '../../schema/articles.content.schema';
import { Favorite } from '@schema/user.favorite.schema';
import { Comment } from '@schema/articles.comment.schema';
import { MemoryStorageService } from '../../memory-storage.service';

describe('ArticlesClientService', () => {
    let service: ArticlesClientService;

    const mockArticleModel = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesClientService,
                { provide: getModelToken(Articles.name), useValue: mockArticleModel },
                { provide: getModelToken(Tags.name), useValue: {} },
                { provide: getModelToken(Config.name), useValue: {} },
                { provide: getModelToken(Favorite.name), useValue: {} },
                { provide: getModelToken(Comment.name), useValue: {} },
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn().mockReturnValue('https://img.test.com/') },
                },
                {
                    provide: MemoryStorageService,
                    useValue: { get: jest.fn(), set: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<ArticlesClientService>(ArticlesClientService);
    });

    describe('getArticleList', () => {
        it('Return Article List', async () => {
            const mockDbArticles = [
                {
                    _id: '123',
                    name: { en: 'Test Title', zh: '测试标题' },
                    introduction: { en: 'Test Des', zh: '测试简介' },
                    guides: { en: [], zh: [] },
                    downloads: { en: [], zh: [] },
                    coverImg: 'test.jpg',
                    tags: [],
                    createdAt: new Date(),
                },
            ];

            //exec() 
            mockArticleModel.exec.mockResolvedValue(mockDbArticles);

       
            const dto = { page: 1, entries: 10 };
            const result = await service.getArticleList(dto, 'en');

            expect(result.code).toBe(0);
            expect(result.data.list[0].title).toBe('Test Title'); 
            expect(result.data.list[0].coverImg).toContain('https://img.test.com/');
            expect(mockArticleModel.find).toHaveBeenCalledWith({ status: 0 });
        });
    });
});