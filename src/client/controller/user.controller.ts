import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { UserClientService } from '../service/user.service'
import { sendMailDto, userRegDto, userLoginDto, userResetPwd, updateUserDto } from '../dto/user.dto'
import { Private, TokenToUser } from '../../common.decorator'
import { response } from 'src/interface';
import type { Response } from 'express';
import { access } from 'fs';


@Controller('auth')
export class UserController {
    constructor(
        private readonly userClientService: UserClientService,
        private readonly configClientService: ConfigClientService,
        private readonly articlesClientService: ArticlesClientService,
    ) { }


    /** 
    * Send verify email
    * 
    * HTTP Method: GET
    * 
    * Request query:
    * - Email*: email address
    * - Type*: 'reg' for register email | 'reset' for reset password 
    *
    * Description:
    * - Base Type send reg or resent verification email
    * - Check email in cache, send count daily, existed
    * - If cache not existed, check db and create cache
    * - Create verification code, update cache
    * - Send email
    * 
    */
    @Get('email')
    async email(@Query() dto: sendMailDto) {
        if (dto.type == "reg") return await this.userClientService.sendRegMail(dto)
        if (dto.type == "reset") return await this.userClientService.sendResetPwdEmail(dto)
        return { code: 1, messages: 'Failed to send the email. Please try again later.' }
    }


    /** 
    * Render sign up page
    */
    @Get('register')
    @Render('frontend/signup')
    async register() {
        return {
            categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
            layout: 'frontend/layouts/main',
            menuActivated: "auth/register",
            type: "mail"
        }
    }

    /** 
    * Check verification code  in  email
    * 
    * HTTP Method: GET
    * 
    * Request query:
    * - Code*: code in email
    *
    * Description:
    * - Base code check status render difference page
    * 
    */
    @Get('register/step')
    @Render('frontend/signup')
    async signup(@Query('code') code: string) {
        if (!code) {
            return {
                categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
                layout: 'frontend/layouts/main',
                menuActivated: "auth/register",
                messages: "The verification link is invalid. Please check the link or request a new one.",
                type: 'error'
            }
        }
        const result = await this.userClientService.checkValidEmail(code, 'reg')
        if (result.code != 0) {
            return {
                categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
                layout: 'frontend/layouts/main',
                menuActivated: "auth/register",
                messages: result.messages,
                type: 'error'
            }
        }
        return {
            categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
            layout: 'frontend/layouts/main',
            menuActivated: "auth/register",
            type: "step"
        }
    }

    /** 
      * Register new user
      * 
      * HTTP Method: POST
      * 
      * Request body:
      * - Code*: code in email
      * - Nickname*:user nickname
      * - Password*:user password
      * - ConfirmPassword*: confirm password
      *
      * Description:
      * - Check passwords same
      * - Decrypt code  to email address
      * - Check email not existed
      * - Create new user
      * - Delete cache
      */
    @Post('register/step')
    async step(@Body() dto: userRegDto) {
        if (!dto.code) return { code: 1, messages: 'The verification link is invalid. Please check the link or request a new one.' }
        if (dto.password !== dto.confirmPassword) return { code: 2, messages: { confirmPassword: ['the passwords do not match.'] } }
        return await this.userClientService.userReg(dto)
    }


    /** 
  * Login user
  * 
  * HTTP Method: POST
  * 
  * Request body:
  * - Email*: email
  * - Password*:user password
  *
  * Description:
  * - Check password and email
  * - Add token to response header
  */

    @Post('login')
    async login(@Body() dto: userLoginDto, @Res() response: Response) {
        const res = await this.userClientService.userLogin(dto)
        if (res.code == 0) {
            response.setHeader('Authorization', `Bearer ${res.data.access_token}`);
            return response.status(200).json({ code: 0, data: { user: res.data.user } });
        }
        return response.status(200).json({ code: res.code, messages: res.messages });
    }

    /** 
    * Render reset password page
    */
    @Get('reset')
    @Render('frontend/reset')
    async sendResetMail() {
        return {
            categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
            layout: 'frontend/layouts/main',
            menuActivated: "auth/reset",
            type: "mail"
        }
    }


    /** 
      * Check verification code  in  email
      * 
      * HTTP Method: GET
      * 
      * Request query:
      * - Code*: code in email
      *
      * Description:
      * - Base code check status render difference page
      * 
      */
    @Get('reset/step')
    @Render('frontend/reset')
    async checkResetPwd(@Query('code') code: string) {
        if (!code) {
            return {
                categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
                layout: 'frontend/layouts/main',
                menuActivated: "auth/reset",
                messages: "The verification link is invalid. Please check the link or request a new one.",
                type: 'error'
            }
        }
        const result = await this.userClientService.checkValidEmail(code, 'reset')
        if (result.code != 0) {
            return {
                categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
                layout: 'frontend/layouts/main',
                menuActivated: "auth/reset",
                messages: result.messages,
                type: 'error'
            }
        }
        return {
            categories: [{ "auth/register": 'Sign up' }, { "auth/reset": 'Reset password' }],
            layout: 'frontend/layouts/main',
            menuActivated: "auth/reset",
            type: "step"
        }
    }


    /** 
      * Reset password
      * 
      * HTTP Method: POST
      * 
      * Request body:
      * - Password*:user password
      * - ConfirmPassword*: confirm password
      *
      * Description:
      * - Check passwords same
      * - Decrypt code  to email address
      * - Check email existed
      * - Updata password
      * - Delete cache
      */
    @Post('reset/step')
    async resetPwd(@Body() dto: userResetPwd) {
        return this.userClientService.userResetPwd(dto)
    }

    /**
     * Render profile page
     */
    @Get('profile')
    async profile(@TokenToUser() user: any, @Res() res: Response,) {
        if (user.sub) {
            return res.render('frontend/profile', {
                categories: [{ "/auth/profile": 'Profile' }], menuActivated: "/auth/profile", layout: 'frontend/layouts/main', user: user
            });
        } else {
            return res.render('frontend/error', {
                messages: 'Your session has expired. Please sign in again.'
            })
        }
    }

    /** 
      * Reset password
      * 
      * HTTP Method: POST
      * 
      * Request body:
      * - Password*:user password
      * - ConfirmPassword*: confirm password
      *
      * Description:
      * - Check passwords same
      * - Decrypt code  to email address
      * - Check email existed
      * - Updata password
      * - Delete cache
      */
    @Post('profile')
    async updateProfile(@TokenToUser() user: any, @Body() dto: updateUserDto, @Res() response: Response) {
        if (user.sub) {
            const res = await this.userClientService.updateProfile(dto, user.sub)
            if (res.code == 0) {
                response.setHeader('Authorization', `Bearer ${res.data.access_token}`);
                return response.status(200).json({ code: 0, data: { user: res.data.user } });
            }
            return response.status(200).json({ code: res.code, messages: res.messages });
        } else {
            return response.status(200).json({ code: 3, messages: "Please log in to continue." });
        }
    }

    /** 
   * Render user favorite page
   *
   * HTTP Method: GET
   * Request query:
   * - Page*: page number
   * - Keyword *: Keyword
   * - Category：Category key
   *
   * Description:
   * - Verify user exited
   * - Find article list through by user favorite relation
   * - Render page return article list with favorite relationship
   */
    @Get('favorite')
    async favoritePage(@Query('page') page = 1, @Query('category') category: string, @TokenToUser() user: any, @Res() res: Response) {
        const userId = user.sub
        if (userId) {
            const articleList = await this.articlesClientService.favoriteArticleList({ page, entries: 20 }, 'en', category, userId)
            const categories = await this.configClientService.getConfigCategory()
            return res.render('frontend/user/favorite', {
                articleList: articleList.data.list,
                categories: categories.data,
                layout: 'frontend/layouts/main',
                menuActivated: 'tag',
                tag: { name: "Favorite" },
                sidebar: { login: false, filter: true },
                user: user,
                filterActivated: category ? category : 'all'
            })
        } else {
            return res.render('frontend/error', {
                messages: 'Your session has expired. Please sign in again.'
            })
        }
    }

    /** 
   * Get user favorite list
   *
   * HTTP Method: GET
   * Request query:
   * - Page*: page number
   * - Entries*: limit number
   * - Category：Category key
   *
   * Description:
   * - Verify user exited
   * - Find article list through by user favorite relation
   * - Page Interface control: layout
   * - Return render list to miniArticle partials html text 
   */

    @Get('favorite/list')
    @Render('partials/frontend/miniArticle')
    async favoritePageList(@Query('page') page, @Query('category') category: string, @TokenToUser() user: any) {
        const userId = user.sub
        const res = await this.articlesClientService.favoriteArticleList({ page, entries: 20 }, 'en', category, userId)
        return {
            articleList: res.data.list,
            layout: false,
        }
    }

    /** 
    * Render user comment page
    *
    * HTTP Method: GET
    *
    * Description:
    * - Verify user exited
    * - Find article list through by user comment relation
    * - Group articles and each article has last comment and each article comment counts
    * - Render page return article list with user comment relation,last comment and comment counts 
    */
    @Get('comment')
    async userComment(@TokenToUser() user: any, @Res() res: Response) {
        const userId = user.sub
        if (userId) {
            const articleList = await this.articlesClientService.commentArticleList({ page: 1, entries: 10 }, userId)
            const categories = await this.configClientService.getConfigCategory()
            return res.render('frontend/user/comment', {
                articleList: articleList.data.list,
                categories: categories.data,
                layout: 'frontend/layouts/main',
                menuActivated: 'tag',
                tag: { name: "Comments" },
                sidebar: { login: false },
                user: user,
            })
        } else {
            return res.render('frontend/error', {
                messages: 'Your session has expired. Please sign in again.'
            })
        }
    }

    /** 
    * Get user comment list
    *
    * HTTP Method: GET
    *
    * -Page*: page number
    * 
    * Description:
    * - Verify user exited
    * - Find article list through by user comment relation
    * - Group articles and each article has last comment and each article comment counts
    * - Page Interface control: layout
    * - Article list with user comment relation,last comment and comment counts 
    * - Return render list to miniComment partials html text
    */

    @Get('comment/list')
    @Render('partials/frontend/miniComment')
    async userCommentList(@TokenToUser() user: any, @Query('page') page = 1) {
        const userId = user.sub
        if (!userId) return { code: 3, messages: 'Please log in to continue.' }
        const res = await this.articlesClientService.commentArticleList({ page, entries: 10 }, userId)
        return {
            articleList: res.data.list,
            layout: false,
            user: user
        }
    }
}