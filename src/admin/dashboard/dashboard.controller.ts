import { Controller, Get, Post, Body, Render, Res, Req, Session } from '@nestjs/common';
import type { Response, Request } from 'express';
import { error } from 'console';
import { ValidateAdminDto } from '../admin/admin.dto'
import { DashboardService } from './dashboard.service'

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }


  @Get('/')
  @Render('backend/dashboard')
  async index() {
    const [users, articles, comments, views] = await this.dashboardService.accumulateData()
    return {
      title: 'Dashboard',
      users,
      articles,
      comments,
      views
    };
  }
}