import { isAsyncIterable, Plugin } from '@envelop/core';
import { ContextType } from '../types';

export const appendMetadata = (): Plugin<ContextType> => {
    return {
        onExecute({ args }) {
            return {
                onExecuteDone({result, setResult}) {
                    // skip if streaming/subscription - boilerplate
                    if(isAsyncIterable(result)) return;
                    const metaData = {requestId: args.contextValue.requestId};
                    const resultWithMetadata = {...result, metadata: metaData};
                    setResult(resultWithMetadata);
                }
            }
        },
    };
};