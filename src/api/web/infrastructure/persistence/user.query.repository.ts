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

    

    async getUserInfoById(id: string) {
        const rawData = await this.userModel
            .findOne({ _id: id })
            .lean()
            .exec();

        if (!rawData) {
            return null;
        }
        return new UsersModel(rawData);
    }



    async createUser(user: UsersModel): Promise<UsersModel | null | undefined> {
        try {
            const newUser = new this.userModel({
                nickname: user.nickname,
                password: user.password,
                email: user.email,
                avatar: "",
                status: 0,
            });
            const savedData = await newUser.save();
            return new UsersModel(savedData.toObject());
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('This email is already registered.');
            }
            throw error;
        }
    }

    async updateUser(user: UsersModel): Promise<UsersModel | null | undefined> {
        try {
            const { id, nickname, password, avatar, status } = user;
            const updatedData = await this.userModel.findOneAndUpdate(
                { _id: id },
                {
                    nickname,
                    password,
                    avatar,
                },
                { new: true, lean: true }
            ).exec();
            if (!updatedData) {
                return null
            }
            return new UsersModel(updatedData);
        } catch (error) {
            throw error;
        }
    }
}