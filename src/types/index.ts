import { Logger } from '../logger';
import type { YogaInitialContext } from 'graphql-yoga';

export type ContextType = YogaInitialContext & {
  requestId: string;
  logger: Logger;
  // Header Field
  clientHeader: string;
};
