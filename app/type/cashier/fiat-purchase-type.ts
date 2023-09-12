export type GetBestRateContentDealerInformationType = {
  id:            number;
  createdAt:     Date;
  updatedAt:     Date;
  deletedAt:     null;
  dealerNo:      string;
  document:      string;
  telegramId:    null;
  isApproved:    boolean;
  isRequest:     boolean;
  status:        string;
  rejectMessage: string;
  trusted:       boolean;
}
export type GetBestRateContentUserType = {
  id:                number;
  createdAt:         Date;
  updatedAt:         Date;
  deletedAt:         null;
  address:           string;
  firstName:         string;
  lastName:          string;
  phoneNumber:       string;
  isInitial:         boolean;
  email:             string;
  line:              null;
  facebook:          null;
  dealerInformation: GetBestRateContentDealerInformationType;
};

export type GetBestRateContentType = {
  amountAvailable: string;
  ceiling: string;
  chainId: string;
  createdAt: Date;
  deletedAt?: Date;
  detail?: string;
  fiat?: any;
  floor: string;
  id: number;
  isActive: boolean;
  margin: string;
  paymentMethod?: any;
  price: string;
  token: any; 
  total: string;
  type: string;
  updatedAt: Date;
  user: GetBestRateContentUserType;
};

export type GetFiatPurchaseRateResponse = {
  price: number;
  id: string;
  dealerAddress: string;
  range: number[];
  getBestRateContent: GetBestRateContentType;
} | null;
