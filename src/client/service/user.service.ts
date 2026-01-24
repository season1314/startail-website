import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { response } from 'src/interface';
import { MemoryStorageService } from '../../memory-storage.service'
import { CommonMethods } from '../../common.method'
import { EmailService } from '../../mail.service';
import { sendMailDto, userRegDto, userResetPwd, userLoginDto, updateUserDto } from '../dto/user.dto';
import { User } from '../../schema/user.schema'
import { CryptoService } from '../../crypto.service'
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserClientService {
    private readonly domain: string;
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly memoryStorageService: MemoryStorageService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly cryptoService: CryptoService,
        private readonly configService: ConfigService,
    ) {
        this.domain = this.configService.get<string>('DOMAIN_URL', '');
    }

    /**
     * Send reg email
     * @param dto 
     * @returns 
     */
    async sendRegMail(dto: sendMailDto): Promise<response> {
        try {
            const cacheKey = "reg:" + dto.email
            const TTL_24H = 60 * 60 * 24;
            let emailCachedData = this.memoryStorageService.get(cacheKey) || { email: dto.email, count: 0, reg: "", key: "" };
            if (emailCachedData.reg == 'existed') { return { code: 1, messages: 'This email is already registered. Please log in.' } }
            if (emailCachedData.count >= 10) return { code: 1, messages: 'Daily email limit reached. Please try again after 24 hours.' }

            const isEmailExisted = await this.userModel.findOne({ email: dto.email }).lean().exec();
            if (isEmailExisted) {
                emailCachedData.reg = 'existed';
                emailCachedData.count = emailCachedData.count + 1
                this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)
                return { code: 1, messages: 'This email is already registered. Please log in' }
            }
            emailCachedData.key = this.cryptoService.encrypt(dto.email)

            const successSendEmail = await this.emailService.sendEmail(
                dto.email,
                "Verify your email",
                'Hello! This is a verify email.',
                `<b>Welcome to Strataii!</b><p>Please click the link below to complete your registration:</p>
                <a href=${this.domain}/auth/register/step?code=${emailCachedData.key}>${this.domain}/auth/register/step?code=${emailCachedData.key}</a>`);

            if (!successSendEmail) return { code: 1, messages: 'Failed to send email. Please try again later.' }
            emailCachedData.count = emailCachedData.count + 1
            this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)

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
            let emailCachedData = this.memoryStorageService.get(cacheKey) || { email: dto.email, count: 0, reg: "", key: "" };
            if (emailCachedData.reg == 'NoExisted') { return { code: 1, messages: 'This email is not existed. Please sign up.' } }
            if (emailCachedData.count >= 10) return { code: 1, messages: 'Daily email limit reached. Please try again after 24 hours.' }
            const isEmailExisted = await this.userModel.findOne({ email: dto.email }).lean().exec();
            if (!isEmailExisted) {
                emailCachedData.reg = 'NoExisted';
                emailCachedData.count = emailCachedData.count + 1
                this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)
                return { code: 1, messages: 'This email is not existed. Please sign up.' }
            }
            emailCachedData.key = this.cryptoService.encrypt(dto.email)

            const successSendEmail = await this.emailService.sendEmail(
                dto.email,
                "Verify your email",
                'Hello! This is a verify email.',
                `<b>Welcome to Strataii!</b><p>Please click the link below to complete reset password:</p>
                <a href=${this.domain}/auth/reset/step?code=${emailCachedData.key}>${this.domain}/auth/reset/step?code=${emailCachedData.key}</a>`);

            if (!successSendEmail) return { code: 1, messages: 'Failed to send email. Please try again later.' }
            emailCachedData.count = emailCachedData.count + 1
            this.memoryStorageService.set(cacheKey, emailCachedData, TTL_24H)
            return { code: 0, messages: `Successful sent valid mail to : ${emailCachedData.email}` }

        } catch (error) {

            return { code: 1, messages: error }

        }
    }


    /**
     * User register
     * @param dto 
     * @returns 
     */
    async userReg(dto: userRegDto): Promise<response> {
        try {
            const { code, password, confirmPassword, nickname } = dto
            const email = this.cryptoService.decrypt(code)
            if (!email) return { code: 1, messages: 'The verification link is invalid. Please check the link or request a new one.' }
            const isEmailExisted = await this.userModel.findOne({ email: email }).lean().exec();
            if (isEmailExisted) return { code: 1, messages: 'This email is already registered. Please log in.' }
            const hashedPassword = await bcrypt.hash(password, 10);
            const created = new this.userModel({
                email: email,
                password: hashedPassword,
                nickname: nickname,
                avatar: '',
                status: 0,
                key: code,
            }).save();
            this.memoryStorageService.delete('reg:' + email)
            return { code: 0, messages: 'Successfully sign up', data: created };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * User reset password
     * @param dto 
     * @returns 
     */
    async userResetPwd(dto: userResetPwd): Promise<response> {
        try {
            const { code, password, confirmPassword } = dto
            if (password !== confirmPassword) return { code: 1, messages: 'Passwords do not match' }
            const email = this.cryptoService.decrypt(code)
            if (!email) return { code: 1, messages: 'The verification link is invalid. Please check the link or request a new one.' }
            const isEmailExisted = await this.userModel.findOne({ email: email });
            if (!isEmailExisted) return { code: 1, messages: "This email is not existed. Please sign up." }
            const hashedPassword = await bcrypt.hash(password, 10);
            isEmailExisted.password = hashedPassword
            isEmailExisted.save()
            this.memoryStorageService.delete('reset:' + email)
            return { code: 0, messages: 'Successfully reset password' };
        } catch (error) {
            return { code: 1, messages: error }
        }
    }

    /**
     * User Login
     * @param dto 
     * @returns 
     */
    async userLogin(dto: userLoginDto): Promise<response> {
        try {
            const TTL_24H = 60 * 60 * 24;
            const { email, password } = dto
            let cachedData = this.memoryStorageService.get('login:' + email) || 10;
            if (cachedData <= 0) return { code: 2, messages: { email: ['Too many login attempts. Please try late.'] } }

            const user = await this.userModel.findOne({ email: email }).lean().exec();
            if (!user) return { code: 2, messages: { email: ['This email address is not signed up yet.'] } }
            if (user.status != 0) return { code: 2, messages: { email: ['This account has been suspended'] } }

            const verifyResult = await bcrypt.compare(password, user.password)
            if (!verifyResult) {
                this.memoryStorageService.set('login:' + email, cachedData - 1, TTL_24H)
                return { code: 2, messages: { password: [`Incorrect password ${cachedData - 1} attempt remaining.`] } }
            }
            const payload = {
                sub: user._id,
                id: user._id,
                nickname: user.nickname,
                email: user.email,
                avatar: user.avatar,
                key: user.key
            }

            return { code: 0, data: { access_token: this.jwtService.sign(payload), user: payload } }
        } catch (error) {
            console.log(error)
            return { code: 1, messages: error }
        }
    }

    /**
     * Verify email code of email link
     * @param code
     * @param type  
     * @returns 
     */
    async checkValidEmail(code: string, type: string): Promise<response> {
        const email = this.cryptoService.decrypt(code)
        if (!email) return { code: 1, messages: 'The verification link is invalid. Please check the link or request a new one.' }
        const cachedData = this.memoryStorageService.get(`${type}:${email}`)
        if (!cachedData) return { code: 1, messages: 'Your verification email has expired. Please request a new one.' }
        if (code !== cachedData.key) return { code: 1, messages: 'Your verification email has expired. Please request a new one.' }
        return { code: 0 }
    }

    /**
     * Update user
     * @param dto 
     * @param id 
     * @returns 
     */
    async updateProfile(dto: updateUserDto, id: string): Promise<response> {
        try {
            const { avatar, nickname } = dto || {}
            const user = await this.userModel.findById(id)
            if (!user) return { code: 3, messages: "Please log in to continue." }
            user.avatar = avatar
            user.nickname = nickname
            const res = await user.save()
            const payload = {
                sub: user._id,
                id: user._id,
                nickname: user.nickname,
                email: user.email,
                avatar: user.avatar,
                key: user.key
            }
            return { code: 0, data: { user: payload, access_token: this.jwtService.sign(payload) } }
        } catch (error) {
            return { code: 1, messages: error }
        }
    }
}