// src/admin/auth.service.ts
import { Injectable, BadRequestException, UsePipes } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from './admin.schema';
import { CreateAdminDto, ResetPasswordDto, UpdateInfoAdminDto } from './admin.dto';
import { GetListDto } from '../admin_core.dto';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import type { response } from '../admin_interface'
import { Permissions } from '../config/config.permissions.schema';
import { CommonMethods } from '../admin.common.method';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>, @InjectModel(Permissions.name) private permissionsModel: Model<Permissions>) { }


  /**
   * create new administrator
   * @param dto  
   * @param createBy  
   * @returns 
   */
  async createAdmin(dto: CreateAdminDto, createBy: string): Promise<response> {
    try {
      if (dto.password !== dto.confirmPassword) {
        return { code: 2, messages: { confirmPassword: ['passwords do not match'] } };
      }
      const existingUser = await this.adminModel.findOne({ username: { $regex: new RegExp(`^${dto.username}$`, 'i') } });
      if (existingUser) {
        return { code: 2, messages: { username: ['username already exists'] } };
      }
      const existingEmail = await this.adminModel.findOne({ email: { $regex: new RegExp(`^${dto.email}$`, 'i') } });
      if (existingEmail) {
        return { code: 2, messages: { email: ['email already exists'] } };
      }
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const created = new this.adminModel({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname,
        avatar: dto.avatar,
        status: 0,
        createdBy: createBy
      }).save();
      return { code: 0, messages: 'Successfully create new administrator : ' + dto.username };
    } catch (error) {
      return { code: 1, messages: error }
    }

  }

  /**
   * Get administrator list
   * @param dto 
   * @returns 
   */
  async getAdmins(dto: GetListDto): Promise<response> {
    const skip = (dto.page - 1) * dto.entries;
    const query: any = {};
    if (dto.keyword) {
      query.$or = [
        { username: { $regex: dto.keyword, $options: 'i' } },
        { email: { $regex: dto.keyword, $options: 'i' } },
        { nickname: { $regex: dto.keyword, $options: 'i' } }
      ];
    }
    const [list, total] = await Promise.all([
      this.adminModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(dto.entries)
        .select('-password -sessionID')
        .lean(),
      this.adminModel.countDocuments(),
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
   * Updata administrator email and nickname
   * @param dto 
   * @returns 
   */

  async editAdminInfo(dto: UpdateInfoAdminDto): Promise<response> {
    try {
      const existingUser = await this.adminModel.findOne({ _id: dto.id });
      if (!existingUser) {
        return { code: 1, messages: 'Administrator is not exists' };
      }
      if (existingUser.username !== dto.username) {
        return { code: 1, messages: 'Administrator data error' }
      }
      const existingEmail = await this.adminModel.findOne({
        email: { $regex: new RegExp(`^${dto.email}$`, 'i') },
        _id: { $ne: existingUser._id }
      });
      if (existingEmail) {
        return { code: 2, messages: { email: ['email already exists'] } };
      }

      existingUser.email = dto.email;
      existingUser.nickname = dto.nickname;
      await existingUser.save();
      return { code: 0, messages: 'Administrator info updated successfully', data: existingUser };

    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * Delete administrator (true delete)
   * @param dto 
   * @returns 
   */

  async deleteAdmin(id: string): Promise<response> {
    try {
      const existingUser = await this.adminModel.findOne({ _id: id });
      if (!existingUser) {
        return { code: 1, messages: 'Administrator is not exists' };
      }
      if (existingUser.permissions.includes('*')) {
        return { code: 1, messages: 'Super administrator can not be delete' }
      }
      const result = await this.adminModel.deleteOne({ _id: existingUser._id });
      return { code: 0, messages: 'Successfully delete administrator : ' + existingUser.username };
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * Switch administrator status 
   * @param dto 
   * @returns
   */

  async switchAdminStatus(id: string, sessionStore: any): Promise<response> {
    try {
      const existingUser = await this.adminModel.findOne({ _id: id })
      if (!existingUser) {
        return { code: 1, messages: 'Administrator is not exists' };
      }
      if (existingUser.permissions.includes('*')) {
        return { code: 1, messages: 'Super administrator can not be disabled' }
      }
      if (existingUser.status == 0) {
        existingUser.status = 1
        if (existingUser.sessionID) await sessionStore.destroy(existingUser.sessionID) //Destroy session let admin re-login
      } else {
        existingUser.status = 0
      }
      await existingUser.save();
      return { code: 0, messages: 'Administrator info updated successfully', data: existingUser };
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * updata new password
   * @param dto 
   * @returns 
   */

  async updateAdminPass(dto: ResetPasswordDto): Promise<response> {
    try {
      if (dto.password !== dto.confirmPassword) return { code: 2, messages: { confirmPassword: ['passwords do not match'] } };
      const existingUser = await this.adminModel.findOne({ _id: dto.id })
      if (!existingUser) {
        return { code: 1, messages: 'Administrator is not exists' };
      }
      if (existingUser.permissions.includes('*')) {
        return { code: 1, messages: 'Super administrator only can update password by self' }
      }
      existingUser.password = await bcrypt.hash(dto.password, 10);
      await existingUser.save()
      return { code: 0, messages: 'Successfully update new password' }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * Get permissionList base admin id and keyword
   * @param id 
   * @param keyword 
   * @returns 
   */

  async permissionList(id: string, keyword: string): Promise<response> {
    try {
      const existingUser = await this.adminModel.findOne({ _id: id })
      if (!existingUser) {
        return { code: 1, messages: 'Administrator is not exists' };
      }
      let query = {};
      if (keyword && keyword.trim() !== '') {
        query = {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { des: { $regex: keyword, $options: 'i' } }
          ]
        };
      }
      const permissions = await this.permissionsModel.find(query).sort({ url: 1 }).exec();
      let list
      if (existingUser.permissions.includes('*')) {
        list = permissions.map(permission => ({
          ...permission.toObject(),
          disabled: true,
          selected: true
        }));
      } else {
        list = permissions.map(permission => {
          if (existingUser.permissions.includes(permission.key)) {
            return {
              ...permission.toObject(),
              selected: true
            }
          } else {
            return {
              ...permission.toObject(),
              selected: false
            }
          }
        })
      }
      return { code: 0, data: { list: list } };
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * Update admin permissions
   * @param id 
   * @param permissions 
   * @returns 
   */
  async updateAdminPermissions(id: string, permissions: string[], sessionStore: any) {
    try {
      const existingUser = await this.adminModel.findOne({ _id: id })
      if (!existingUser) return { code: 1, messages: 'Administrator is not exists' }
      if (existingUser.permissions.includes('*')) return { code: 1, messages: 'Super Administrator permission can not be changed' }

      const isPermissionEquality = await CommonMethods.arraysEqualIgnoreOrder(existingUser.permissions, permissions)
      if (isPermissionEquality) {
        return { code: 0, messages: 'Successful update permissions' }// Avoid user mis-touch submit button return a fake success
      }
      if (permissions == existingUser.permissions) return { code: 0, messages: 'Successful update permissions' }
      if (existingUser.sessionID) await sessionStore.destroy(existingUser.sessionID);//Delete session in store, let admin re-login get new session
      existingUser.permissions = permissions
      await existingUser.save()
      return { code: 0, messages: 'Successful update permissions' }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }
}