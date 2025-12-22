import { Injectable } from '@nestjs/common';
import type { response } from '../admin_interface'
import { ValidateAdminDto } from '../admin/admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../admin/admin.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) { }


  async validateUser(dto: ValidateAdminDto): Promise<response> {
    const existingUser = await this.adminModel.findOne({ username: dto.username });
    if (!existingUser) return { code: 2, messages: { username: ['username not exists'] } };
    const isPasswordValid = await bcrypt.compare(dto.password, existingUser.password);
    if (!isPasswordValid) return { code: 2, messages: { password: ['password is invalid'] } };
    return { code: 0, messages: 'Login successful',data:existingUser}
  }
}
