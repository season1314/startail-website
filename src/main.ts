import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';
import { configureHbs } from './hbs.config';
import { ValidationPipe, HttpException, Logger } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './Http200ExceptionFilter';
import { SessionValidationMiddleware, FormValidationPipe, PermissionValidationMiddleware, RateLimitingMiddleware, JwtAuthGuard } from './middleware.pipe.guard'
import { request } from 'http';

const session = require('express-session');


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  const viewsDir = join(__dirname, '..', 'views');
  app.setBaseViewsDir(viewsDir);
  app.setViewEngine('hbs');
  configureHbs(viewsDir);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(new RateLimitingMiddleware().use)
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 259200000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );


  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  /*
   * Pipe: Used for handling param and body, but cannot access session.
   * Interceptor: Good for API calls but causes asynchronous issues when you need to stop the request flow (e.g., for rendering a page).
   * Middleware: Ideal for request interception, rendering pages, and controlling the request flow synchronously, making it the best choice for login validation.
   */
  app.use(new SessionValidationMiddleware().use);

  /**
   * Middleware check admin permission
   */

  app.use(new PermissionValidationMiddleware().use)


  app.useGlobalPipes(new FormValidationPipe())


  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));


  await app.listen(3001);

  console.log('Server running at http://localhost:3001');
}
bootstrap();
