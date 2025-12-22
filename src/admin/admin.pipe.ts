import { Injectable, PipeTransform, UnauthorizedException, HttpException, CallHandler, ExecutionContext, NestInterceptor, NestMiddleware, HttpStatus } from '@nestjs/common';
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'
import { ArgumentMetadata } from '@nestjs/common';


@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.url.startsWith('/admin') && req.url !== '/admin/login') {
      const contentType = req.method;
      if (!req.session || !req.session.user) {
        //GET re-renders else return Json 
        if (contentType == 'GET') return res.render('backend/login', { title: 'Login Required', message: 'You must be logged in to access this resource.' });
        else throw new HttpException({ code: 3, messages: 'Unauthorized access. Please log in.' }, HttpStatus.UNAUTHORIZED)
      }
    }
    next();
  }
}


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
