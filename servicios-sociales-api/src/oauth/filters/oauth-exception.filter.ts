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

        const request = ctx.getRequest();
        const path = request.url;

        // Solo actuamos si el error viene de una ruta de OAuth
        if (!path.includes('oauth')) {
            // Si no es OAuth, dejamos que el AllExceptionsFilter (el siguiente) lo maneje
            throw exception;
        }

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

        // Logs para depuración en AWS CloudWatch
        console.log(`[OAuthFilter] Error detectado en ${path}: ${message}`);
        console.log(`[OAuthFilter] Redirigiendo a: ${frontendUrl}`);

        // Redirigir al login del staff con el mensaje de error
        // Aseguramos que la ruta sea /staff-gate que es donde está tu interfaz de la captura
        const redirectUrl = `${frontendUrl}/staff-gate?error=${encodeURIComponent(message)}`;
        
        return response.redirect(redirectUrl);
    }
}
