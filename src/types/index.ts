import { Logger } from '../logger';
import type { YogaInitialContext } from 'graphql-yoga';
import { getMeshSDK } from '../../.mesh'

export type MeshSDK = ReturnType<typeof getMeshSDK>

export type ContextType = YogaInitialContext & {
  requestId: string;
  logger: Logger;
  // Header Field
  clientHeader: string;
  meshSDK: MeshSDK
};
