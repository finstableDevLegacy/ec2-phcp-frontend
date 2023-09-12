import { NetworkID } from "./network-id";

export const getValiChainDealer = () => {
  if (process.env.ENV === "development") {
    return [NetworkID.BkcTest];
  } else if (process.env.ENV === "production") {
    return [NetworkID.Bkc];
  } else {
    return [NetworkID.BkcTest];
  }
};
