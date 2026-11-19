import type { Plugin } from '@envelop/core';
import { v4 as uuid } from 'uuid';
import { ContextType } from '../types';
import { getOperationAST, GraphQLError } from 'graphql';

const CLIENT_HEADER = 'x-client';
const STRATA_CLIENT = 'strata';

// helper functions for seperate lifecycle hook actions
const _validateClientHeader = (args: any, extendContext: any): void => {
  const operationAST = getOperationAST(args.document, args.operationName);
  const isClientStrata = args.contextValue.clientHeader === STRATA_CLIENT;

  // abort any execution of clients attempting to run mutations or subscriptions
  if(isClientStrata && operationAST?.operation !== 'query') {
    throw new GraphQLError(`Operation ${operationAST?.operation} not allowed: Requires valid ${CLIENT_HEADER} header.`, {
      extensions: {
        code: 'FORBIDDEN_OPERATION',
        http: { status: 403 }
      }
    })
  }
};

const _createRequestId = (extendContext: any): void => {
  const requestId = uuid();
  extendContext({ requestId: requestId});
};

export const buildHeaders = (): Plugin<ContextType> => {
  return {
    onContextBuilding({context, extendContext}) {
      const clientHeader = context.request.headers.get(CLIENT_HEADER);
      if(!clientHeader) {
        throw new GraphQLError(`Header ${CLIENT_HEADER} is required.`, {
          extensions: {
            code: 'MISSING_HEADER',
            http: { status: 400}
          }
        })
      }
      extendContext({
        clientHeader: clientHeader
      });
    },
    onExecute({args, extendContext }) {
      _validateClientHeader(args, extendContext);
      _createRequestId(extendContext);
    },
  };
};
