import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PermissionsSchema } from '../../schema/config.permissions.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePermissionDto, editPermissionDto, configDto } from './config.dto'
import { Permissions } from '../../schema/config.permissions.schema';
import { Config } from '../../schema/config.common.schema'
import type { response } from '../../interface'
import dayjs from 'dayjs';
import { GetListDto } from '../admin_core.dto'

@Injectable()
export class ConfigService {
    constructor(@InjectModel(Permissions.name) private permissionsModel: Model<Permissions>, @InjectModel(Config.name) private configModel: Model<Config>) { }

    /**
       * Get permissions list
       * @param dto 
       * @returns 
       */
    async getPermissions(dto: GetListDto): Promise<response> {
        const skip = (dto.page - 1) * dto.entries;
        const query: any = {};
        if (dto.keyword) {
            query.$or = [
                { uname: { $regex: dto.keyword, $options: 'i' } },
            ];
        }
        const [list, total] = await Promise.all([
            this.permissionsModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(dto.entries)
                .select('-password')
                .lean().exec(),
            this.permissionsModel.countDocuments(),
        ]);

        const formatList = list.map(item => ({
            ...item,
            createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }));

        return {
            code: 0,
            data: {
                list: formatList,
                total,
                page: dto.page,
                pageSize: dto.entries,
                totalPages: Math.ceil(total / dto.entries),
            }
        };
    }




    /**
     * Create new permission
     * @param dto 
     * @param createBy 
     * @returns 
     */
    async createPermission(dto: CreatePermissionDto, createBy: string): Promise<response> {
        try {
            const query = { url: { $regex: new RegExp(`^${dto.url}$`, 'i') }, method: { $regex: new RegExp(`^${dto.method}$`, 'i') } }
            const existingPermission = await this.permissionsModel.findOne(query)
            if (existingPermission) return { code: 1, messages: 'The url and Http method is already used' }
            const key = dto.url + ':' + dto.method;
            const created = new this.permissionsModel({
                name: dto.name,
                url: dto.url,
                method: dto.method,
                des: dto.des || '',
                createdBy: createBy,
                key: key
            }).save();
            return { code: 0, messages: 'Successfully created new permission' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }


    /**
     * Edit permission
     * @param dto 
     * @returns 
     */
    async editPermission(dto: editPermissionDto): Promise<response> {
        try {
            const existingPermission = await this.permissionsModel.findOne({ _id: dto.id })
            if (!existingPermission) return { code: 1, messages: 'Permission is not existing' }
            existingPermission.des = dto.des || ''
            existingPermission.name = dto.name
            await existingPermission.save()
            return { code: 0, messages: 'Successfully update permission' }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Delete permission
     * @param id 
     * @returns 
     */

    async deletePermission(id: string): Promise<response> {
        try {
            const existingPermission = await this.permissionsModel.findOne({ _id: id })
            if (!existingPermission) return { code: 1, messages: 'Permission is not existing' }
            const result = await this.permissionsModel.deleteOne({ _id: existingPermission._id });
            return { code: 0, messages: 'Successfully delete permission' };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * Get config
     * @param key 
     * @returns 
     */

    async getConfig(key: string): Promise<response> {
        try {
            const config = await this.configModel.findOne({ key: key })
            return { code: 0, data: config }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }


    /**
     * Save Config
     * @param dto 
     * @param createBy 
     * @returns 
     */

    async SaveConfig(dto: configDto, createBy: string): Promise<response> {
        try {
            const config = await this.configModel.findOne({ key: dto.key })
            if (!config) {
                const data = new this.configModel({
                    name: dto.name,
                    key: dto.key,
                    property: dto.property,
                    createBy: createBy
                }).save()
                return { code: 0, messages: 'Successful save config property', data: data }
            } else {
                config.name = dto.name
                config.key = dto.key
                config.property = dto.property
                config.createdBy = createBy
                const data = await config.save()
                return { code: 0, messages: 'Successful save config property', data: data }
            }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }
}
