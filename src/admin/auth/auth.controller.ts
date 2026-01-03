import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { error } from 'console';
import { ValidateAdminDto, ResetPasswordDto } from '../admin/admin.dto'
import * as session from 'express-session';
import { validate } from 'class-validator';
const { promisify } = require('util');
import { FormValidationPipe } from '../admin.pipe';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  /**
   *  Render administrator page
   */
  @Get('login')
  @Render('backend/login')
  index() {
    return {
      title: 'Login',
    };
  }

  /**
    * login
    * 
    * HTTP Method: POST
    * Request Body:
    * - username  * (string): Admin username
    * - password  * (string): Admin password
    *
    * Description:
    * valid username and password
    * create session and save sessionID in admin table 
    */

  @Post('login')
  async login(@Body() dto: ValidateAdminDto, @Req() req: Request, @Session() session: Record<string, any>) {
    return await this.authService.validateUser(dto, session, req.sessionID);
  }



  /**
   *  Render administrator page
   */
  @Get('auth')
  @Render('backend/profile')
  getAuth() {
    return {
      title: 'Profile',
      bc: [
        { url: '#', name: 'Dashboard' },
        { url: '#', name: 'Profile' },
      ],
    }
  }


  /**
   * Get current admin info 
   * 
   * HTTP Method: POST
   * Request Body:null
   *
   * Description:
   * valid administrator existed
   * return user info
   */
  @Get('auth/info')
  async getAuthInfo(@Session() session: Record<string, any>) {
    return this.authService.getUserInfo(session.user.id)
  }


  /**
 * Logout
 * 
 * HTTP Method: DELETE
 * 
 * Description:
    * check session
    * delete session
 */
  @Delete('auth')
  async logout(@Req() req: Request, @Res() res: Response, @Session() session: Record<string, any>) {
    try {
      const destroySession = promisify(session.destroy).bind(session);
      await destroySession()
      res.redirect('/admin/admin')
    } catch (error) {
      return { code: 1, messages: error }
    }
  }


  /**
 * Update current administrator
 * 
 * HTTP Method: PUT
 * 
 * Description:
 * type:password - update password
 * type:avatar - update avatar
 */
  @Put('auth')
  async edit(@Body() body:any, @Session() session: Record<string, any>) {
    if (body.type == "password") {
      const dto = new ResetPasswordDto()
      dto.id = session.user.id
      dto.password = body.password
      dto.confirmPassword = body.confirmPassword
      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        const formValidationPipe = new FormValidationPipe();
        const exception = formValidationPipe['exceptionFactory'](validationErrors);
        throw exception
      }
      return await this.authService.resetPassword(dto)
    }
    if (body.type == "avatar") {
      return await this.authService.updateAvatar(body.path, session.user.id)
    }
    return { code: 1, messages: 'System error: Update options are missing' }
  }
}