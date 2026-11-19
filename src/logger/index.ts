import winston from 'winston';

export class Logger {
  private winston: any;
  requestId: string = '';
  clientHeader: string = '';
  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [new winston.transports.Console()],
    });
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  setClientHeader(clientHeader: string) {
    this.clientHeader = clientHeader;
  }

  info(message: string, meta?: object) {
    this.winston.info(message, {...meta, requestId: this.requestId, clientHeader: this.clientHeader});
  }

  error(message: string, meta?: object) {
    this.winston.error(message, {...meta, requestId: this.requestId, clientHeader: this.clientHeader});
  }

  warn(message: string, meta?: object) {
    this.winston.warn(message, {...meta, requestId: this.requestId, clientHeader: this.clientHeader});
  }
}
