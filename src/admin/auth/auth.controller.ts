import { Controller, Get, Post, Body, Render, Res, Req,Session } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { error } from 'console';
import { ValidateAdminDto } from '../admin/admin.dto'
import * as session from 'express-session';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Get('login')
  @Render('backend/login')
  index() {
    return {
      title: 'Login',
    };
  }


  @Post('login')
  async postLogin(@Body() dto: ValidateAdminDto,@Session() session: Record<string, any>) {
    const result =  await this.authService.validateUser(dto);
    if(result.code != 0) return result 
    session.user = result.data
    return result
  }
}
