import { Injectable, PipeTransform, UnauthorizedException, HttpException, CallHandler, ExecutionContext, NestInterceptor, NestMiddleware, HttpStatus } from '@nestjs/common';
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'
import { ArgumentMetadata } from '@nestjs/common';
import { AuthService } from './admin/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { resolve } from 'path';
import rateLimit from 'express-rate-limit';


/**
 * MiddleWare to admin login status
 */
@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.url.startsWith('/admin') && req.url !== '/admin/login') {
      const contentType = req.method;
      if (!req.session || !req.session.user) {
        //GET re-renders else return Json 
        if (contentType == 'GET') return res.render('backend/login', { title: 'Login', messages: 'You must be logged in to access this resource.' });
        else throw new HttpException({ code: 3, messages: 'Unauthorized access. Please log in.' }, HttpStatus.UNAUTHORIZED)
      }
    }
    next();
  }
}

//Pip:convert dto error as HTTP error to  custom error
@Injectable()
export class FormValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = {};
        errors.forEach(err => {
          if (err.constraints) {
            formattedErrors[err.property] = Object.values(err.constraints);
          }
        });
        return new HttpException({ code: 2, messages: formattedErrors }, 400,);
      },
    });
  }
}

//Middleware:handle admin permission
@Injectable()
export class PermissionValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.url.startsWith('/admin') && req.url !== '/admin/login' && req.url !== '/admin/auth' && req.url !== '/admin/upload') {
      const permissions = req.session.user.permissions
      let url = req.url.split('?')[0]
      if (url.endsWith('/list')) url = url.slice(0, -5)
      const key = url + ':' + req.method
      if (!permissions.includes('*') && !permissions.includes(key)) {
        if (req.method == 'GET') {
          return res.render('backend/error', { title: 'error', messages: 'You did not have permission to access this page.' });
        } else {
          throw new HttpException({ code: 1, messages: 'You did not have permission to this operation' }, HttpStatus.UNAUTHORIZED)
        }
      }
    }
    next();
  }
}



//Middleware:security for repeatedly calling an API
@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private limiter: any;
  constructor() {
    this.limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.use = this.use.bind(this);
  }
  use(req: Request, res: Response, next: NextFunction): void {
    this.limiter(req, res, next);
  }
}