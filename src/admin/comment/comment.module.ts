import { Module } from '@nestjs/common';
import { Comment, CommentSchema } from '../../schema/articles.comment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from './comment.service'
import { CommentController } from './comment.controller'
import { MemoryStorageService } from '../../memory-storage.service'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),

    ],
    controllers: [CommentController],
    providers: [CommentService, MemoryStorageService],
    exports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
        ]),

    ]
})
export class CommentModule { }