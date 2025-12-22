import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Render,
  Res,
  Req,
  Query,
  Session,
  Delete,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FormValidationPipe } from '../admin.pipe';
import type { Response, Request } from 'express';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateInfoAdminDto, ResetPasswordDto } from './admin.dto';
import { GetListDto } from '../admin_core.dto';
import { error } from 'console';
import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { AdminModule } from './admin.module';

@Controller()
export class AdminController {
  constructor(private readonly AdminService: AdminService) { }

  @Get()
  @Render('backend/admin/admin')
  index() {
    return {
      title: 'Administrator',
      bc: [
        { url: '#', name: 'Dashboard' },
        { url: '#', name: 'Administrator' },
      ],
    };
  }

  /**
   * Get administrator list
   *
   * HTTP Method: Get
   * Request query:
   * - page:  * (number): Page number
   * - entries: (number): entries : default 20
   * - keyword：(string): username keyword for search
   *
   * Description:
   *
   * base the page and keyword get administrator list
   */

  @Get('list')
  async list(@Query() dto: GetListDto) {
    return this.AdminService.getAdmins(dto);
  }

  /**
   * Create a new administrator account
   *
   * HTTP Method: POST
   * Request Body:
   * - username  * (string): Admin username
   * - password  * (string): Admin password
   * - confirmPassword  * (string): Must match the password
   * - email * (string): Admin email address
   * - nickname (string | null): Admin nickname
   * - avatar (string | null): Admin avatar URL
   *
   * Description:
   * create administrator , validates that
   * username length between 6 ~ 20 and must be unique
   * password length between 6 ~ 20
   * email format
   * password and confirmPassword match, then saves the
   * new administrator account to the database and returns the result.
   */

  @Post()
  async create(@Body() dto: CreateAdminDto, @Session() session: Record<string, any>) {
    const createBy = session.user.username
    return this.AdminService.createAdmin(dto, createBy)
  }

  /**
    * Edit administrator
    *
    * HTTP Method: PUT
    * Request Body:
    * - Id * (string): Admin Id
    * - username (string): Admin username
    * - password (string): Admin password
    * - confirmPassword  (string): Must match the password
    * - email (string): Admin email address
    * - nickname (string | null): Admin nickname
    * - status (number): user status
    *
    * Description:
    * Edit administrator on three separate conditions
    * 1.Edit info: if pass username
    * 2.Edit password: if pass password
    * 3.Switch status: if pass status
    */

  @Put()
  async edit(@Body() body: any, @Session() session: Record<string, any>) {
    if (!body.id) { return { code: 1, messages: 'System error: Id is missing' } }

    if (body.type == "editInfo") {
      const dto = new UpdateInfoAdminDto()
      dto.id = body.id
      dto.username = body.username
      dto.email = body.email
      dto.nickname = body.nickname
      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        const formValidationPipe = new FormValidationPipe();
        const exception = formValidationPipe['exceptionFactory'](validationErrors);
        throw exception
      }
      return this.AdminService.editAdminInfo(dto)
    }

    if (body.type == "switchStatus") {
      return this.AdminService.switchAdminStatus(body.id)
    }

    if (body.type == "resetPass") {
      const dto = new ResetPasswordDto()
      dto.id = body.id
      dto.password = body.password
      dto.confirmPassword = body.confirmPassword
      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        const formValidationPipe = new FormValidationPipe();
        const exception = formValidationPipe['exceptionFactory'](validationErrors);
        throw exception
      }
      return this.AdminService.updateAdminPass(dto)
    }
    return { code: 1, messages: 'System error: Edit options are missing' }
  }


  /**
      * Delete administrator information
      *
      * HTTP Method: Delete
      * Request Body:
      * - Id * (string): Admin Id
      *
      * Description:
      * Check delete administrator's permissions
      * Delete administrator who is not super administrator
      */

  @Delete()
  async delete(@Query() body: any, @Session() session: Record<string, any>) {
    if (!body.id) { return { code: 1, messages: 'System error: Id is missing' } }
    return this.AdminService.deleteAdmin(body.id)
  }

  /**
      * Render administrator' permission set page
      *
      * HTTP Method: Get
      * Request Query:
      * - Id * (string): Admin Id
      *
      * Description:
      * Check delete administrator's permissions
      * Delete administrator who is not super administrator
      */



  @Get('permissions')
  @Render('backend/admin/permissions')
  permissionsIndex() {
    return {
      title: 'Administrator',
      bc: [
        { url: '#', name: 'Dashboard' },
        { url: '#', name: 'Administrator' },
        { url: '#', name: 'Permission' },
      ],
    };
  }


  @Get('permissions/list')
  async permissionsList(@Query() body: any) {
    if (!body.id) { return { code: 1, messages: 'System error: Id is missing' } }
    return this.AdminService.permissionList(body.id)
  }
}
