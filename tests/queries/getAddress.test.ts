import { parse, ExecutionResult } from 'graphql';
import { executor } from '../exectuor';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type CustomExecutionResults<TData = Record<string, any>> = ExecutionResult<TData> & {
  metadata?: {
    requestId: string;
  }
}

describe('getAddress', () => {
  test('Success', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
      context: {
        clientHeader: {
          'x-client': 'strata'
        }
      }
    }) as CustomExecutionResults;
    expect(result.data).toEqual({
      "address": {
        street: '123 Street St.',
        city: 'Sometown',
        zipcode: '43215',
      }
    });
    expect(result.metadata).toEqual({
      requestId: expect.stringMatching(UUID_REGEX)
    })
  });

  test('Error', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'john' };

    const result = await executor({
      document: parse(query),
      variables,
      context: {
        clientHeader: {
          'x-client': 'strata'
        }
      }
    });

    expect(result).toEqual(
      expect.objectContaining(
        {
          "errors": expect.arrayContaining([expect.objectContaining({
            "message": "No address found in getAddress resolver"
          })])
        }
      )
    );
  });
});
