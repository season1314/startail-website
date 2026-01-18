import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService) { }

    async sendEmail(
        to: string,
        subject: string,
        text: string,
        html?: string,
    ): Promise<boolean> {
        try {
            const transporter = nodemailer.createTransport({
                host: this.configService.get<string>('SMTP_HOST'),
                port: Number(this.configService.get<string>('SMTP_PORT')),
                secure: Boolean(this.configService.get<string>('SMTP_SECURE')),
                auth: {
                    user: this.configService.get<string>('SMTP_USER'),
                    pass: this.configService.get<string>('SMTP_PASS'),
                },
            });

            const info = await transporter.sendMail({
                from: this.configService.get<string>('SMTP_FROM'),
                to,
                subject,
                text,
                html,
            });

            if (info && info.messageId) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
}
