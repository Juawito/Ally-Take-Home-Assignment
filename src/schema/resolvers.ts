import { getAddress, addAddress } from "./address/address";
import { Address, GetAddressArgs, CreateAddressArgs } from "./address/types";
import { getNearEarthObjects } from "./neoFeed/neoFeed";
import { getNEOFeedArgs, NearEarthObjectFeed } from "./neoFeed/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: GetAddressArgs, context: any, info: any): Address => {
      return getAddress(parent, args, context);
    },
    nearEarthObjects: (parent: any, args: getNEOFeedArgs, context: any, info: any): Promise<NearEarthObjectFeed> => {
      return getNearEarthObjects(parent, args, context);
    }
  },
  Mutation: {
    address: (parent: any, args: CreateAddressArgs, context: any, info: any): Address => {
      return addAddress(parent, args, context);
    }
  }
};
