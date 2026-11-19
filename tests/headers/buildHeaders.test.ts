jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    readFileSync: jest.fn(actualFs.readFileSync),
    writeFileSync: jest.fn(),
  };
});

import fs from 'fs';
import { parse, ExecutionResult } from 'graphql';
import { executor } from '../exectuor';

const actualReadFileSync = jest.requireActual('fs').readFileSync;
const EXISTING_ADDRESSES = {
  jack: { street: '123 Street St.', city: 'Sometown', zipcode: '43215' },
};

const readFileSync = fs.readFileSync as jest.Mock;
const writeFileSync = fs.writeFileSync as jest.Mock;

const QUERY = `
  query GetAddress($username: String!) {
    address(username: $username) {
      street
      city
      zipcode
    }
  }
`;

const MUTATION = `
  mutation AddAddress($username: String!, $address: AddressInput!) {
    address(username: $username, address: $address) {
      street
      city
      zipcode
    }
  }
`;

describe('header enforcement', () => {
  beforeEach(() => {
    readFileSync.mockImplementation((filePath: string, options?: any) => {
      if (typeof filePath === 'string' && filePath.endsWith('addresses.json')) {
        return JSON.stringify(EXISTING_ADDRESSES);
      }
      return actualReadFileSync(filePath, options);
    });
    writeFileSync.mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('missing x-client header rejects the request', async () => {
    const result = (await executor({
      document: parse(QUERY),
      variables: { username: 'jack' },
    })) as ExecutionResult;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Header x-client is required.',
          extensions: expect.objectContaining({ code: 'MISSING_HEADER' }),
        }),
      ])
    );
  });

  test('x-client: strata rejects a mutation', async () => {
    const result = (await executor({
      document: parse(MUTATION),
      variables: {
        username: 'strata-mutation',
        address: { street: '1 Test St', city: 'Testville', zipcode: '00000' },
      },
      context: { clientHeader: { 'x-client': 'strata' } },
    })) as ExecutionResult;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'FORBIDDEN_OPERATION' }),
        }),
      ])
    );
  });

  test('x-client: strata allows a query', async () => {
    const result = (await executor({
      document: parse(QUERY),
      variables: { username: 'jack' },
      context: { clientHeader: { 'x-client': 'strata' } },
    })) as ExecutionResult;

    expect(result.errors).toBeUndefined();
    expect(result.data?.address).toBeTruthy();
  });

  test('non-strata client allows a mutation', async () => {
    const result = (await executor({
      document: parse(MUTATION),
      variables: {
        username: 'non-strata-mutation',
        address: { street: '1 Test St', city: 'Testville', zipcode: '00000' },
      },
      context: { clientHeader: { 'x-client': 'some-other-client' } },
    })) as ExecutionResult;

    expect(result.errors).toBeUndefined();
    expect(result.data?.address).toEqual({
      street: '1 Test St',
      city: 'Testville',
      zipcode: '00000',
    });
  });
});
