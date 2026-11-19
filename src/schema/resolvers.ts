import { getAddress, addAddress } from "./address/address";
import { Address, GetAddressArgs, CreateAddressArgs } from "./address/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: GetAddressArgs, context: any, info: any): Address => {
      return getAddress(parent, args, context);
    },
  },
  Mutation: {
    address: (parent: any, args: CreateAddressArgs, context: any, info: any): Address => {
      return addAddress(parent, args, context);
    }
  }
};
