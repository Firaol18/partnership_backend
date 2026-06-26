// src/modules/common-modules/logger/logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
import winston from 'winston';

@Injectable()
export class LoggerService extends Logger {
  private winstonLogger: winston.Logger;

  constructor() {
    super();
    this.winstonLogger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.winstonLogger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }
  }

  log(message: string, context?: string) {
    super.log(message, context);
    this.winstonLogger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.winstonLogger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    this.winstonLogger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    this.winstonLogger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    this.winstonLogger.verbose(message, { context });
  }
}
