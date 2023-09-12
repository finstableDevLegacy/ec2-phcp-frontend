import { ManagerData } from "./manager";

export type MemberResponseType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  prevPassword: string | null;
  phoneNumber: string;
  confirmToken: string;
  createdAt: string;
  updatedAt: string;
  role: string;
};

export interface IAddMemberForm {
  managerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  platformStore: string;
}

export interface MemberMerchantRegister {
  name: string; // Merchant name
  address: string; //  merchat address
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  acceptFiat: boolean;
}

export type LoginMemberResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type MemberDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  prevPassword: any;
  phoneNumber: string;
  confirmToken: string;
  createdAt: string;
  updatedAt: string;
  managerId: string;
  managerData?: ManagerData;
};
