import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import * as fs from 'fs';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
export class FilesController {
    constructor(private readonly configService: ConfigService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                /***
                 * Create new path
                 */
                destination: (
                    req: Request,
                    file: Express.Multer.File,
                    cb: (error: Error | null, destination: string) => void,
                ) => {
                    const dateDir = dayjs().format('YYYY-MM'); //created folder named as year-month
                    const uploadPath = join( //store path
                        process.cwd(),
                        'public/uploads',
                        dateDir,
                    );
                    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true }); //if path is not existed,create it 
                    cb(null, uploadPath);
                },
                /**
                 * Create new file name
                 * @param req 
                 * @param file 
                 * @param cb 
                 */
                filename: (
                    req: Request,
                    file: Express.Multer.File,
                    cb: (error: Error | null, filename: string) => void,
                ) => {
                    const ext = extname(file.originalname);
                    cb(null, `${Date.now()}${ext}`);
                },
            }),

            /**
             * Verify accepted files type and ext name
             * @param req 
             * @param file 
             * @param cb 
             * @returns 
             */
            fileFilter: (req, file, cb) => {
                const allowedMimeType = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']; //accept files type
                const allowedExt = ['.png', '.jpg', '.jpeg', '.pdf'] //accept files ext name
                const ext = extname(file.originalname).toLowerCase()
                if (!allowedMimeType.includes(file.mimetype) && !allowedExt.includes(ext)) return cb(null, false);
                cb(null, true)
            },

            limits: { fileSize: 5 * 1024 * 1024 } // accept size below 5MB
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) return { code: 1, messages: 'Only accept png / jpg / pdf files, file size below 5MB' }
        const imgUrl = this.configService.get<string>('IMG_URL')
        return {
            code: 0,
            message: 'Successful upload file',
            data: { url: `${imgUrl}/uploads/${dayjs().format('YYYY-MM')}/${file.filename}`}
        };
    }
}
