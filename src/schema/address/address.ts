import * as fs from 'fs';
import * as path from 'path'; 
const addressDbPath = path.join(__dirname,  '../../../data/addresses.json');
import { Addresses, Address, GetAddressArgs, CreateAddressArgs } from './types';
import { GraphQLError } from 'graphql';

const _readAddresses = (context: any): Addresses => {
  try {
    const data = fs.readFileSync(addressDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    context.logger.error('_readAddresses', error);
    throw new GraphQLError('Unable to load address records', {
      extensions: { code: 'INTERNAL_SERVER_ERROR'},
    });
  }
};

const _getAddress = (username: string, context: any): Address => {
  const addressesData = _readAddresses(context);
  return addressesData[username];
};

const _writeAddress = (username: string, address: Address, context: any): Address => {
  const currentAddresses = _readAddresses(context);
  if (currentAddresses[username]) {
    throw new GraphQLError('Username already Exists', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  currentAddresses[username] = address;
  try {
    fs.writeFileSync(addressDbPath, JSON.stringify(currentAddresses, null, 2));
  } catch (error) {
    context.logger.error('_writeAddress', error);
    throw new GraphQLError('Unable to write new address record', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
  return currentAddresses[username];
};

export const getAddress = (_: any, args: GetAddressArgs, context: any): Address => {
  context.logger.info('getAddress: Enter resolver');
  const address = _getAddress(args.username, context);
  if (address) {
    context.logger.info('getAddress: Returning address');
    return address;
  }
  context.logger.error('getAddress: No address found');
  throw new GraphQLError('No address found in getAddress resolver');
};

export const addAddress = (_: any, args: CreateAddressArgs, context: any): Address => {
  context.logger.info('addAddress: Enter mutation');
  const newAddress = _writeAddress(args.username, args.address, context);

  if(newAddress) {
    context.logger.info('addAddress: Write address succesfull');
    return newAddress;
  }
  context.logger.error('addAddress: Write address failed');
  throw new GraphQLError('Adding new address error.');
};
