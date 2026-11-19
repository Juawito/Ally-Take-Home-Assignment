import type { Plugin } from '@envelop/core';
import uuid from 'uuid';
import { Logger } from '../logger';
import { ContextType } from '../types';

export const useLogger = (): Plugin<ContextType> => {
  return {
    onContextBuilding({ context, extendContext }) {
      const logger = new Logger();
      logger.setRequestId(context.requestId);
      logger.setClientHeader(context.clientHeader);
      extendContext({ logger: logger });
    },
  };
};
