import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const exceptionResponse = exception.getResponse() as any;


        const { code, messages, data } = exceptionResponse;

        const responseBody: any = {
            code: code,
            messages: messages || { global: [exception.message] },
        };

        if (data !== undefined && data !== null) {
            responseBody.data = data;
        }
        response.status(200).json(responseBody);
    }
}
