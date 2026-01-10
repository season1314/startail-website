"use server";
import type { MailProps } from "@/server/interface/commonInterface"
import nodemailer from "nodemailer";
export async function mail(data: MailProps) {
    const { email, from, subject, html } = data
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    try {
        await transporter.sendMail({
            from: from,
            to: email,
            subject: subject,
            html: html,
        });
        return { code: 0, message: 'Successful sent mail' };
    } catch (error) {
        return { code: 1, message: error };
    }
}