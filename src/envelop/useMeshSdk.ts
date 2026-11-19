import type { Plugin } from '@envelop/core';
import { ContextType, MeshSDK } from '../types';
import { getMeshSDK } from '../../.mesh'

const meshSDK = getMeshSDK();
export const useMeshSDK = (): Plugin<ContextType> => {
  return {
    onContextBuilding({ extendContext }) {
      extendContext({ meshSDK });
    },
  };
};
