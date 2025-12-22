import { Controller, Get, Post, Body, Render, Res, Req,Session } from '@nestjs/common';
import type { Response, Request } from 'express';
import { error } from 'console';
import { ValidateAdminDto } from '../admin/admin.dto'

@Controller()
export class DashboardController {
//   constructor(private readonly authService: AuthService) { }


  @Get('/')
  @Render('backend/dashboard')
  index() {
    return {
      title: 'Dashboard',
    };
  }
}