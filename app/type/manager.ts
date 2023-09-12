export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  createdAt: Date;
  id: string;
  updatedAt: Date;
}

export interface ManagerData {
  id: string;
  walletAddress: string;
  name: string;
  address: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  acceptFiat: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentOption {
  id: string;
  name: string;
}

