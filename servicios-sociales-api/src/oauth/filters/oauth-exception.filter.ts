import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

        let message = 'Error de autenticación';
        
        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'object') {
                message = (res as any).message || (res as any).error || message;
            } else {
                message = res;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Redirigir al login del staff con el mensaje de error
        const redirectUrl = `${frontendUrl}/staff-gate?error=${encodeURIComponent(message)}`;
        return response.redirect(redirectUrl);
    }
}
