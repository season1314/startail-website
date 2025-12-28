import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put } from '@nestjs/common';
import type { Request, Response } from 'express';
// import { AuthService } from './auth.service';
import { error } from 'console';
import { ValidateAdminDto, ResetPasswordDto } from '../admin/admin.dto'
import * as session from 'express-session';
import { validate } from 'class-validator';
const { promisify } = require('util');
import { FormValidationPipe } from '../admin.pipe';
import { ArticlesService } from './articles.service'


@Controller()
export class ArticlesController {
    constructor(private readonly authService: ArticlesService) { }

    /**
     *  Render tags page
     */
    @Get('tags')
    @Render('backend/articles/tags')
    index() {
        return {
            title: 'Tags',
        };
    }


}