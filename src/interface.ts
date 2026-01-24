import { Request } from 'express'

export interface response<T = any> {
    code: number;
    messages?: {};
    data?: T;
}


export interface RequestWithToken extends Request {
    token?: string;
}