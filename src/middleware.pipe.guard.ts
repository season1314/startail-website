import { Injectable, PipeTransform, UnauthorizedException, HttpException, CallHandler, ExecutionContext, NestInterceptor, NestMiddleware, HttpStatus } from '@nestjs/common';
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'
import { ArgumentMetadata } from '@nestjs/common';
import { AuthService } from './admin/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { resolve } from 'path';
import rateLimit from 'express-rate-limit';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import cookie from 'cookie';
import type { RequestWithToken } from './interface'



//MiddleWare: admin login status and user cookie token
@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
  use(req: RequestWithToken, res: Response, next: NextFunction): void {
    if (
      req.url.startsWith('/uploads') ||
      req.url.startsWith('/backend') ||
      req.url.startsWith('/frontend') ||
      req.url.endsWith('.js') ||
      req.url.endsWith('.css') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.jpg') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.jpeg') ||
      req.url.endsWith('.pdf') ||
      req.url.endsWith('.json')
    ) {
      return next();
    }

    if (req.url.startsWith('/admin') && req.url !== '/admin/login') {
      const contentType = req.method;
      if (!req.session || !req.session.user) {
        //GET re-renders else return Json 
        if (contentType == 'GET') return res.render('backend/login', { title: 'Login', messages: 'You must be logged in to access this resource.' });
        else throw new HttpException({ code: 3, messages: 'Unauthorized access. Please log in.' }, HttpStatus.UNAUTHORIZED)
      }
    } else {
      const cookies = req.headers.cookie;
      if (cookies) {
        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies['token'];
        if (token) { req.token = token }
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
    if (
      req.url.startsWith('/uploads') ||
      req.url.startsWith('/backend') ||
      req.url.startsWith('/frontend') ||
      req.url.endsWith('.js') ||
      req.url.endsWith('.css') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.jpg') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.jpeg') ||
      req.url.endsWith('.pdf') ||
      req.url.endsWith('.json')
    ) {
      return next();
    }
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



//Middleware:security for repeatedly calling
@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private limiter: any;
  constructor() {
    this.limiter = rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 2000,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.session?.id ?? req.ip;
      },
    });

    this.use = this.use.bind(this);
  }
  use(req: Request, res: Response, next: NextFunction): void {
    if (
      req.url.startsWith('/uploads') ||
      req.url.startsWith('/backend') ||
      req.url.startsWith('/frontend') ||
      req.url.endsWith('.js') ||
      req.url.endsWith('.css') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.jpg') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.jpeg') ||
      req.url.endsWith('.pdf') ||
      req.url.endsWith('.json')
    ) {
      return next();
    }
    this.limiter(req, res, next);
  }
}


//Guard:User 
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const requireAuth = this.reflector.getAllAndOverride<boolean>('isPrivate', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireAuth) {
      return true;
    }
    return super.canActivate(context);
  }
}



