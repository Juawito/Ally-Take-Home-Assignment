export type Address = {
  street: string | null;
  city: string | null;
  zipcode: string | null;
  state?: string | null;
};

// Runtime Check/Parse would be a good addition since new field is not present in current data.
export type Addresses = {
  [key: string]: Address;
};

export type Args = {
  username: string;
};
