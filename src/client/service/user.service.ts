import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { response } from 'src/admin/admin_interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'
import { EmailService } from '../../mail.service';
import { sendMailDto, userRegDto, userResetPwd, userLoginDto } from '../dto/user.dto';
import { User } from '../../schema/user.schema'
import { CryptoService } from '../../crypto.service'
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserClientService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly memoryStorageService: MemoryStorageService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly cryptoService: CryptoService
    ) { }

    /**
     * Send reg email
     * @param dto 
     * @returns 
     */
    async sendRegMail(dto: sendMailDto): Promise<response> {
        try {
            const cacheKey = "reg:" + dto.email
            const TTL_24H = 60 * 60 * 24;

            let emailCachedData = await this.memoryStorageService.get(cacheKey) || { email: dto.email, count: 0, reg: "", key: "" };
            if (emailCachedData.reg == 'existed') { return { code: 1, messages: 'This email is already registered. Please log in.' } }
            if (emailCachedData.count >= 10) return { code: 1, messages: 'Daily email limit reached. Please try again after 24 hours.' }

            const isEmailExisted = await this.userModel.findOne({ email: dto.email }).lean().exec();
            if (isEmailExisted) {
                emailCachedData.reg = 'existed';
                emailCachedData.count = emailCachedData.count + 1
                await this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)
                return { code: 1, messages: 'This email is already registered. Please log in' }
            }
            emailCachedData.key = this.cryptoService.encrypt(dto.email)

            const successSendEmail = await this.emailService.sendEmail(
                dto.email,
                "Verify your email",
                'Hello! This is a verify email.',
                `<b>Welcome to Strataii!</b><p>Please click the link below to complete your registration:</p>
                <a href="http://www.startaii.com/auth/register?code=${emailCachedData.key}">http://www.startaii.com/auth/register?code=${emailCachedData.key}</a>`);

            if (!successSendEmail) return { code: 1, messages: 'Failed to send email. Please try again later.' }
            emailCachedData.count = emailCachedData.count + 1
            await this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)

            return { code: 0, messages: `Successful sent valid mail to : ${emailCachedData.email}` }

        } catch (error) {

            return { code: 1, messages: error }

        }
    }


    /**
     * Send reset password email
     * @param dto 
     */
    async sendResetPwdEmail(dto: sendMailDto): Promise<response> {
        try {
            const cacheKey = "reset:" + dto.email
            const TTL_24H = 60 * 60 * 24;
            let emailCachedData = await this.memoryStorageService.get(cacheKey) || { email: dto.email, count: 0, reg: "", key: "" };
            if (emailCachedData.reg == 'NoExisted') { return { code: 1, messages: 'This email is not existed. Please sign up.' } }
            if (emailCachedData.count >= 10) return { code: 1, messages: 'Daily email limit reached. Please try again after 24 hours.' }
            const isEmailExisted = await this.userModel.findOne({ email: dto.email }).lean().exec();
            if (!isEmailExisted) {
                emailCachedData.reg = 'NoExisted';
                emailCachedData.count = emailCachedData.count + 1
                await this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)
                return { code: 1, messages: 'This email is not existed. Please sign up.' }
            }
            emailCachedData.key = this.cryptoService.encrypt(dto.email)

            const successSendEmail = await this.emailService.sendEmail(
                dto.email,
                "Verify your email",
                'Hello! This is a verify email.',
                `<b>Welcome to Strataii!</b><p>Please click the link below to complete reset password:</p>
                <a href="http://www.startaii.com/auth/register?code=${emailCachedData.key}">http://www.startaii.com/auth/register?code=${emailCachedData.key}</a>`);

            if (!successSendEmail) return { code: 1, messages: 'Failed to send email. Please try again later.' }
            emailCachedData.count = emailCachedData.count + 1
            await this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)
            return { code: 0, messages: `Successful sent valid mail to : ${emailCachedData.email}` }

        } catch (error) {

            return { code: 1, messages: error }

        }
    }


    /**
     * 
     * @param dto 
     * @returns 
     */
    async userReg(dto: userRegDto): Promise<response> {
        try {
            const { email, password, confirmPassword, nickname } = dto
            if (password !== confirmPassword) return { code: 1, messages: 'Passwords do not match' }
            const isEmailExisted = await this.userModel.findOne({ email: email }).lean().exec();
            if (isEmailExisted) return { code: 1, messages: 'This email is already registered. Please log in.' }
            const hashedPassword = await bcrypt.hash(password, 10);
            const created = new this.userModel({
                email: email,
                password: hashedPassword,
                nickname: nickname,
                avatar: '',
                status: 0,
            }).save();
            await this.memoryStorageService.delete('reg:' + email)
            return { code: 0, messages: 'Successfully sign up', data: created };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * 
     * @param dto 
     * @returns 
     */
    async userResetPwd(dto: userResetPwd): Promise<response> {
        try {
            const { email, password, confirmPassword } = dto
            if (password !== confirmPassword) return { code: 1, messages: 'Passwords do not match' }
            const isEmailExisted = await this.userModel.findOne({ email: email });
            if (!isEmailExisted) return { code: 1, messages: "This email is not existed. Please sign up." }
            const hashedPassword = await bcrypt.hash(password, 10);
            isEmailExisted.password = hashedPassword
            isEmailExisted.save()
            await this.memoryStorageService.delete('reset:' + email)
            return { code: 0, messages: 'Successfully reset password' };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    async userLogin(dto: userLoginDto): Promise<response> {
        try {
            const TTL_24H = 60 * 60 * 24;
            const { email, password } = dto
            let cachedData = await this.memoryStorageService.get('login:' + email) || 10;
            if (cachedData <= 0) return { code: 1, messages: 'Too many login attempts. Please try late.' }

            const user = await this.userModel.findOne({ email: email }).lean().exec();
            if (!user) return { code: 1, messages: 'This email address is not signed up yet' }
            if (user.status != 0) return { code: 1, messages: "This account has been suspended" }

            const verifyResult = await bcrypt.compare(password, user.password)
            if (!verifyResult) {
                await this.memoryStorageService.set('login:' + email, cachedData - 1, TTL_24H)
                return { code: 1, messages: `Incorrect password ${cachedData - 1} attempt remaining.` }
            }
            const payload = {
                sub: user._id,
                nickname: user.nickname,
                email: user.email,
            }
            return { code: 0, data: { access_token: this.jwtService.sign(payload) } }

        } catch (error) {
            return { code: 1, messages: error }
        }
    }
}