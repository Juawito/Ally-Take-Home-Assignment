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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type CustomExecutionResult<TData = Record<string, any>> = ExecutionResult<TData> & {
  metadata?: {
    requestId: string;
  };
};

const MUTATION = `
  mutation AddAddress($username: String!, $address: AddressInput!) {
    address(username: $username, address: $address) {
      street
      city
      zipcode
    }
  }
`;

const EXISTING_ADDRESSES = {
  jack: { street: '123 Street St.', city: 'Sometown', zipcode: '43215' },
};

const readFileSync = fs.readFileSync as jest.Mock;
const writeFileSync = fs.writeFileSync as jest.Mock;

describe('addAddress mutation', () => {
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

  test('creates a new address', async () => {
    const result = (await executor({
      document: parse(MUTATION),
      variables: {
        username: 'newuser',
        address: { street: '1 Test St', city: 'Testville', zipcode: '00000' },
      },
      context: { clientHeader: { 'x-client': 'some-other-client' } },
    })) as CustomExecutionResult;

    expect(result.errors).toBeUndefined();
    expect(result.data?.address).toEqual({
      street: '1 Test St',
      city: 'Testville',
      zipcode: '00000',
    });
    expect(result.metadata).toEqual({
      requestId: expect.stringMatching(UUID_REGEX),
    });

    expect(writeFileSync).toHaveBeenCalledTimes(1);
    const [, writtenContent] = writeFileSync.mock.calls[0];
    const written = JSON.parse(writtenContent as string);
    expect(written.newuser).toEqual({
      street: '1 Test St',
      city: 'Testville',
      zipcode: '00000',
    });
    expect(written.jack).toEqual(EXISTING_ADDRESSES.jack);
  });

  test('rejects a duplicate username', async () => {
    const result = (await executor({
      document: parse(MUTATION),
      variables: {
        username: 'jack',
        address: { street: '1 Test St', city: 'Testville', zipcode: '00000' },
      },
      context: { clientHeader: { 'x-client': 'some-other-client' } },
    })) as ExecutionResult;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Username already Exists',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }),
        }),
      ])
    );
    expect(writeFileSync).not.toHaveBeenCalled();
  });
});
