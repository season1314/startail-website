import { Injectable } from '@nestjs/common';
import type { response } from '../admin_interface'
import { ValidateAdminDto, ResetPasswordDto } from '../admin/admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../admin/admin.schema';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class AuthService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>, private readonly configService: ConfigService) { }


  /**
   * Admin login
   * @param dto 
   * @returns 
   */
  async validateUser(dto: ValidateAdminDto, session: Record<string, any>, sessionID: string): Promise<response> {
    try {
      if (!sessionID) return { code: 1, messages: 'System error:sessionID is null' }
      const existingUser = await this.adminModel.findOne({ username: dto.username });
      if (!existingUser) return { code: 2, messages: { username: ['username not exists'] } };
      const isPasswordValid = await bcrypt.compare(dto.password, existingUser.password);
      if (!isPasswordValid) return { code: 2, messages: { password: ['password is invalid'] } };
      if (existingUser.status == 1) return { code: 1, messages: 'You has been banned login the system' }
      existingUser.sessionID = sessionID //operation of session 
      await existingUser.save()
      session.user = existingUser
      return { code: 0, messages: 'Login successful',data:{avatar:existingUser.avatar} }
    } catch (error) {
      return { code: 1, messages: error }

    }
  }

  /**
   * Get admin info 
   * @param id 
   * @returns
   */
  async getUserInfo(id: string): Promise<response> {
    try {
      const existingUser = await this.adminModel.findOne({ _id: id }).select('-password -sessionID');
      if (!existingUser) return { code: 1, messages: 'Administrator is not exists' }
      const userObject = existingUser.toObject()
      const data = {
        ...userObject,
        createdAt: dayjs(existingUser.createdAt).format('YYYY-MM-DD HH:mm'),
      }
      if (data.avatar) {
        const imgUrl = this.configService.get<string>('IMG_URL')
        data.avatar = imgUrl + data.avatar
      }
      return { code: 0, data: data }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }


  /**
   * Reset password
   * @param dto 
   * @param id 
   * @returns 
   */
  async resetPassword(dto: ResetPasswordDto): Promise<response> {
    try {
      if (dto.password !== dto.confirmPassword) return { code: 2, messages: { confirmPassword: ['passwords do not match'] } };
      const existingUser = await this.adminModel.findOne({ _id: dto.id });
      if (!existingUser) return { code: 1, messages: 'Administrator is not exists' }
      existingUser.password = await bcrypt.hash(dto.password, 10);
      await existingUser.save()
      return { code: 0, messages: 'Successful reset password' }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }

  /**
   * Update current administrator avatar
   * @param path 
   * @param id 
   * @returns 
   */
  async updateAvatar(path: string, id: string): Promise<response> {
    try {
      if (!path) return { code: 1, messages: 'The file path is missing' };
      const existingUser = await this.adminModel.findOne({ _id: id });
      if (!existingUser) return { code: 1, messages: 'Administrator is not exists' }
      existingUser.avatar = path;
      await existingUser.save()
      return { code: 0, messages: 'Successful update avatar' }
    } catch (error) {
      return { code: 1, messages: error }
    }
  }
}
