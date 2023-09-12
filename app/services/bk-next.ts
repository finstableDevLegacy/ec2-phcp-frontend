import axios, { AxiosRequestHeaders } from "axios";
import {
  BKNextABI,
  BKNextContractDetail,
  BKNextContractList,
  BKNextTXResponse,
} from "~/type/bknext/bk-next.type";
import { getCurrentUrl } from "~/utils/url";

const OAUTH_BASE_URL = `https://accounts.bitkubnext.com`;
const ACCOUNT_BASE_URL = `https://api.bitkubnext.io/accounts`;
const WALLET_BASE_URL = `https://api.bitkubnext.io/wallets`;

const getAuthorizeUrl = () => {
  const callbackUrl = `${getCurrentUrl()}/oauth/callback`;
  const encodedUrl = encodeURIComponent(callbackUrl);
  const url = `https://accounts.bitkubnext.com/oauth2/authorize?response_type=code&client_id=${window.ENV.BITKUB_NEXT_ID}&redirect_uri=${encodedUrl}`;
  return url;
};

const exchangeToken = (code: string) => {
  type Response = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string[];
    token_type: string;
  };
  const callbackUrl = `${getCurrentUrl()}/oauth/callback`;

  const url = `${OAUTH_BASE_URL}/oauth2/access_token`;
  const headers = {
    Authorization: Buffer.from(`${window.ENV.BITKUB_NEXT_ID}:`).toString(
      "base64"
    ),
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", window.ENV.BITKUB_NEXT_ID!);
  params.append("redirect_uri", callbackUrl);
  params.append("code", code);
  return axios
    .post(url, params, { headers })
    .then((res) => res.data as Response);
};

const extendToken = (refreshToken: string) => {
  type Response = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string[];
    token_type: string;
  };

  const url = `${OAUTH_BASE_URL}/oauth2/access_token`;
  const headers = {
    Authorization: Buffer.from(`${window.ENV.BITKUB_NEXT_ID}:`).toString(
      "base64"
    ),
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", window.ENV.BITKUB_NEXT_ID!);
  params.append("refresh_token", refreshToken);
  return axios
    .post(url, params, { headers })
    .then((res) => res.data as Response);
};

const loadAccountInfo = (accessToken: string) => {
  type Response = {
    data: {
      accepted_term_and_condition: string;
      aud: string;
      client_id: string;
      email: string;
      exp: number;
      has_email: boolean;
      has_migrade: boolean;
      has_password: boolean;
      has_pincode: boolean;
      iat: number;
      id: string;
      iss: string;
      lang: string;
      latest_term_and_condition: string;
      phone: string;
      status: string;
      sub: string;
      username: string;
      wallet_address: string;
    };
    ok: boolean;
  };
  const url = `${ACCOUNT_BASE_URL}/auth/info`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  return axios.get(url, { headers }).then((res) => res.data as Response);
};

const createApprovalURL = async (
  accessToken: string,
  callbackUrl: string,
  contractAddress: string,
  methodName: string,
  methodParams: string[]
) => {
  type Response = {
    ok: boolean;
    data: {
      id: string;
      approve_url: string;
      expires_in: number;
    };
  };
  const url = `${ACCOUNT_BASE_URL}/approvals`;

  const rawDescription = `send ${methodName}(${methodParams.join(", ")})`;
  const description =
    rawDescription.length > 128
      ? rawDescription.substring(0, 125) + "..."
      : rawDescription;

  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };

  const body = {
    chain: "BKC_MAINNET",
    type: "CONTRACT_CALL",
    description: description,
    callback_url: callbackUrl,
    contract_address: contractAddress,
    contract_method_name: methodName,
    contract_method_params: methodParams,
  };

  return axios.post(url, body, { headers }).then((res) => res.data as Response);
};

const createTxQueue = async (
  accessToken: string,
  contractAddress: string,
  methodName: string,
  methodParams: string[]
) => {
  const url = `${WALLET_BASE_URL}/transactions/queue`;
  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };
  const body = {
    network: "BKC_MAINNET", // TODO: change to mainnet
    contract_address: contractAddress,
    contract_method_name: methodName,
    contract_method_params: methodParams,
  };
  return axios.post(url, body, { headers }).then(
    (res) =>
      res.data as {
        queue_id: string;
      }
  );
};

const createTxQueueApproval = async (
  accessToken: string,
  approveToken: string
) => {
  const url = `${WALLET_BASE_URL}/transactions/queue/approval`;
  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };
  const body = {
    approve_token: approveToken,
  };
  return axios
    .post(url, body, { headers })
    .then((res) => res.data as { queue_id: string });
};

const createProjectContract = async (
  accessToken: string,
  contractAddress: string,
  contractABI: BKNextABI[],
  required_approval: boolean
) => {
  const url = `${WALLET_BASE_URL}/project-contract`;
  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };
  const body = {
    contract_address: contractAddress,
    contract_abi: contractABI,
    network: "BKC_MAINNET",
    required_approval,
  };
  return axios
    .post(url, body, { headers })
    .then((res) => res.data as { status: string });
};

const getProjectContracts = async (accessToken: string) => {
  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };
  let url = `${WALLET_BASE_URL}/project-contract/list?network=BKC_MAINNET`;
  return axios
    .get(url, { headers })
    .then((res) => res.data as BKNextContractList);
};

const getContractDetail = async (
  accessToken: string,
  contractAddress: string
) => {
  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };
  let url = `${WALLET_BASE_URL}/project-contract?network=BKC_MAINNET&contract=${contractAddress}`;
  return axios
    .get(url, { headers })
    .then((res) => res.data as BKNextContractDetail);
};

const checkTxQueue = async (accessToken: string, id: string) => {
  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-next-client-id": window.ENV.BITKUB_NEXT_ID
      ? String(window.ENV.BITKUB_NEXT_ID)
      : "",
  };
  let url = `${WALLET_BASE_URL}/transactions/queue/${id}`;
  return axios
    .get(url, { headers })
    .then((res) => res.data as BKNextTXResponse);
};

const bitkubNextService = {
  getAuthorizeUrl,
  exchangeToken,
  extendToken,
  loadAccountInfo,
  createApprovalURL,
  createTxQueue,
  createProjectContract,
  getProjectContracts,
  getContractDetail,
  createTxQueueApproval,
  checkTxQueue,
};

export default bitkubNextService;
