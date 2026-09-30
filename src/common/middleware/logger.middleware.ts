import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, body, query, params } = request;
    const startTime = Date.now();

    const safeBody = body && typeof body === 'object' ? { ...body } : body;
    if (safeBody?.password) safeBody.password = '********';
    if (safeBody?.currentPassword) safeBody.currentPassword = '********';
    if (safeBody?.newPassword) safeBody.newPassword = '********';

    const details = [];
    if (safeBody && Object.keys(safeBody).length > 0) {
      details.push(`Body: ${JSON.stringify(safeBody)}`);
    }
    if (query && Object.keys(query).length > 0) {
      details.push(`Query: ${JSON.stringify(query)}`);
    }
    if (params && Object.keys(params).length > 0) {
      details.push(`Params: ${JSON.stringify(params)}`);
    }

    const payloadInfo = details.length > 0 ? ` | ${details.join(' | ')}` : '';
    this.logger.log(`--> [INCOMING] ${method} ${originalUrl}${payloadInfo}`);

    response.on('finish', () => {
      const { statusCode } = response;
      const responseTime = Date.now() - startTime;
      const message = `<-- [RESPONSE] ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`;

      if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}