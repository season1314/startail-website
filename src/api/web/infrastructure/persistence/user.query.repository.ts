import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '@schema/user.schema';
import { UsersModel } from '@domain/models/users.model';
import { IUsersQueryRepository } from '@domain/repositories/users-query.repository.interface'

@Injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }


    async getUserInfoByEmail(email: string) {
        const rawData = await this.userModel
            .findOne({ email: email })
            .lean()
            .exec();

        if (!rawData) {
            return null;
        }
        return new UsersModel(rawData);
    }
}