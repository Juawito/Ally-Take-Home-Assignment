jest.mock('winston', () => require('../winstonMock').winstonMock);

import { Logger } from '../../src/logger';
import { mockWinstonLogger } from '../winstonMock';

describe('Logger', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('includes requestId in every info/error/warn call', () => {
    const logger = new Logger();
    logger.setRequestId('request-123');

    logger.info('an info message');
    logger.error('an error message');
    logger.warn('a warn message');

    expect(mockWinstonLogger.info).toHaveBeenCalledWith(
      'an info message',
      expect.objectContaining({ requestId: 'request-123' })
    );
    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      'an error message',
      expect.objectContaining({ requestId: 'request-123' })
    );
    expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
      'a warn message',
      expect.objectContaining({ requestId: 'request-123' })
    );
  });

  test('includes clientHeader in every info/error/warn call', () => {
    const logger = new Logger();
    logger.setClientHeader('some-client');

    logger.info('an info message');
    logger.error('an error message');
    logger.warn('a warn message');

    expect(mockWinstonLogger.info).toHaveBeenCalledWith(
      'an info message',
      expect.objectContaining({ clientHeader: 'some-client' })
    );
    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      'an error message',
      expect.objectContaining({ clientHeader: 'some-client' })
    );
    expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
      'a warn message',
      expect.objectContaining({ clientHeader: 'some-client' })
    );
  });

  test('defaults requestId and clientHeader to empty string when unset', () => {
    const logger = new Logger();

    logger.info('an info message');

    expect(mockWinstonLogger.info).toHaveBeenCalledWith(
      'an info message',
      expect.objectContaining({ requestId: '', clientHeader: '' })
    );
  });
});
