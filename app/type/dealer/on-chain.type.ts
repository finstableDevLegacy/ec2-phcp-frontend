export type OnChainDealerOrderType = {
  amount: string;
  buyer: {
    id: string;
  };
  fee: string;
  id: string;
  seller: {
    id: string;
  };
  status: string;
  token: TokenType;
  txnHash: string;
};

type TokenType = {
  id: string;
  name: string;
  symbol: string;
};
