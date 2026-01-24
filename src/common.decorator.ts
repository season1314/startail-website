import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';





export const Private = () => SetMetadata('isPrivate', true);


//Token to user info
export const TokenToUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<{ token?: string }>();
        const secret = process.env.JWT_SECRET
        const jwtService = new JwtService({ secret: secret });
        try {
            return jwtService.verify(req.token || "");
        } catch (error) {
            return {}
        }
    }
);
