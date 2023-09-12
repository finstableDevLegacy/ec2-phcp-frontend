import axios from "axios";
import { string } from "yup/lib/locale";
import {
  IAddMemberForm,
  MemberMerchantRegister,
  LoginMemberResponse,
  MemberDetail,
} from "~/type/member";

const TRANSCRYPT_BACKEND = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

export const api = () =>
  axios.create({
    baseURL: TRANSCRYPT_BACKEND,
  });

export const getMemberList = ({ managerId = "", page = 1, limit = 10 }) => {
  return api().get(
    `/members?filter=managerId||$eq||${managerId}&page=${page}&limit=${limit}`
  );
};

export const getMemberByID = async (id: string) => {
  const resp = await api().get(`/members?filter=id||$eq||${id}`);
  return resp.data[0] as MemberDetail;
};

export const createMember = (accessToken: string, data: IAddMemberForm) => {
  return api().post(
    `/members`,
    { ...data },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const createMemberManager = (
  accessToken: string,
  data: MemberMerchantRegister,
  platformStore: string,
  type?: string,
  name?: string,
  address?: string
) => {
  return api().post(
    `/managers`,
    { ...data, platformStore, type, name, address },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const updateMemberManagerByID = (
  accessToken: string,
  data: MemberMerchantRegister,
  id: string,
  bankAccountId: string
) => {
  return api().patch(
    `/managers/${id}`,
    { ...data, bankAccountId },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const deleteMember = (accessToken: string, id: string) => {
  return api().delete(`/members/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export const loginMember = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const resp = await api().post("/members/validate", { username, password });
  return resp.data as LoginMemberResponse;
};

export const requestResetPassword = async (
  email: string,
  platformStore?: string
) => {
  const resp = await api().post("/members/request-reset-password", {
    email,
    platformStore,
  });
  return resp.data;
};

export const requestResetPasswordStatus = async (cft: string) => {
  const resp = await api().get(
    `/members/request-reset-password/status?cft=${cft}`
  );
  return resp.data;
};

export const resetPassword = async ({
  id,
  newPassword,
  confirmPassword,
}: {
  id: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const resp = await api().post(`/members/${id}/reset-password`, {
    newPassword,
    confirmNewPassword: confirmPassword,
  });
  return resp.data;
};
