import { Controller, Get, Post, Body, Render, Res, Req, Session, Query, Put, Delete, Param } from '@nestjs/common';
import type { Response, Request } from 'express';
import { error } from 'console';
import { ValidateAdminDto } from '../admin/admin.dto'
import { GetListDto } from '../admin_core.dto'
import { CreatePermissionDto, editPermissionDto } from './config.dto';
import { ConfigService } from './config.service';
import { validate } from 'class-validator';
import { FormValidationPipe } from '../../middleware.pipe.guard';
import session from 'express-session';

@Controller()
export class ConfigController {
    constructor(private readonly ConfigService: ConfigService) { }


    /**
     * Render permissions page
     * @returns 
     */
    @Get('permissions')
    @Render('backend/config/permissions')
    permissionsIndex() {
        return {
            title: 'Permissions',
            items: ['Permissions'],
            bc: [
                { url: '#', name: 'Dashboard' },
                { url: '#', name: 'Configuration' },
                { url: '#', name: 'Permissions' },
            ],
        };
    }

    /**
     * Get permissions list
     *
     * HTTP Method: Get
     * Request query:
     * - keyword：(string): name keyword for search
     *
     * Description:
     *
     * base  keyword get permissions list
     */

    @Get('permissions/list')
    async list(@Query() dto: GetListDto) {
        return this.ConfigService.getPermissions(dto);
    }




    /**
     * Create new permission     
     * 
     * HTTP Method: Post
     * Request Body:
     * - name:  * (string): Permission name
     * - method: *(enum): Http method:POST GET DELETE PUT
     * - url:*(string) Request url
     * - des:(string): Permission description
     *
     * Description:
     *
     * Valid Body then create new permission
     * Already has record both match with url and method can not create
     */

    @Post('permissions')
    async create(@Body() dto: CreatePermissionDto, @Session() session: Record<string, any>) {
        const createBy = session.user.username
        return await this.ConfigService.createPermission(dto, createBy)
    }


    /**
    * Edit permission     
    * 
    * HTTP Method: Post
    * Request Body:
    * - id:  * (string): Permission id
    * - name: *(string): Permission name
    * - des:(string): Permission description
    *
    * Description:
    *
    * Valid then update name and des base id 
    */

    @Put('permissions')
    async edit(@Body() body: any) {
        if (!body.id) { return { code: 1, messages: 'System error: Id is missing' } }
        const dto = new editPermissionDto()
        dto.id = body.id
        dto.name = body.name
        dto.des = body.des
        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
            const formValidationPipe = new FormValidationPipe();
            const exception = formValidationPipe['exceptionFactory'](validationErrors);
            throw exception
        }
        return await this.ConfigService.editPermission(dto)
    }

    /**
   * Delete permission     
   * 
   * HTTP Method: Delete
   * Request Query:
   * - id:  * (string): Permission id
   *
   * Description:
   *
   * Valid permission existed than delete permission base id
   */

    @Delete('permissions')
    async delete(@Query() body: any) {
        if (!body.id) { return { code: 1, messages: 'System error: Id is missing' } }
        return await this.ConfigService.deletePermission(body.id)
    }


    /**
     * Render category page
     * @returns 
     */

    @Get('categories')
    @Render('backend/config/categories')
    categoryIndex() {
        return {
            title: 'Categories',
            items: ['Categories'],
            bc: [
                { url: '#', name: 'Dashboard' },
                { url: '#', name: 'Configuration' },
                { url: '#', name: 'Categories' },
            ],
        };
    }


    /**
      * Get config
      *
      * HTTP Method: Get
      * Request query:
      * - key(string): config key
      *
      * Description:
      * base  key find config column
      */

    @Get('config')
    async getConfig(@Query() body: any) {
        if (!body.key) { return { code: 1, messages: 'System error: key is missing' } }
        return await this.ConfigService.getConfig(body.key)
    }

    /**
     * Save config
     * 
     * HTTP Method: Get
     * 
     * Request body:
     * - key(string):config key 
     * - name(string): config name
     * - property(any): config property
     * 
     * Description:
     * find key in db update config
     * can not find key in db create config
     */
    @Post('config')
    async saveConfig(@Body() dto: any, @Session() session: Record<string, any>) {
        if (!dto.key) { return { code: 1, messages: 'System error: key is missing' } }
        if (!dto.name) { return { code: 1, messages: 'System error: name is missing' } }
        return await this.ConfigService.SaveConfig(dto, session.user.id)
    }

        /**
     * Render languages page
     * @returns 
     */

        @Get('languages')
        @Render('backend/config/languages')
        LanguagesIndex() {
            return {
                title: 'Languages',
                items: ['Languages'],
                bc: [
                    { url: '#', name: 'Dashboard' },
                    { url: '#', name: 'Configuration' },
                    { url: '#', name: 'Languages' },
                ],
            };
        }
}
