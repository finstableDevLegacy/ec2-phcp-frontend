export const fotmatToString = (value: number | string | undefined) => {
  if (typeof value === "undefined") return value;
  if (typeof value === "string") return Number(value).toFixed(3);
  return value.toFixed(3);
};

export const formatNumber = (
  value: number | string | undefined,
  decimals = 5
) => {
  if (typeof value === "undefined" || !value) return "0";
  return (+value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const truncateAddress = (address?: string, length: number = 4) => {
  if (!address) return "";
  const left = address.substr(0, length);
  const right = address.substr(address.length - length);
  return `${left}...${right}`;
};

export const formatCapitalize = (str: string) =>
  str.replace(/^\w/, (c) => c.toUpperCase());

export const isPasswordValid = (password: any, passwordConfirmation: any) => {
  if (!password || !passwordConfirmation) return false;
  return password === passwordConfirmation;
};

export const isEMailvalidate = (value: any) => {
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(value);
};

export const passLengthValidation = (value: any) => {
  const re = new RegExp(`^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$`);
  return re.test(value);
};

export const emailRegEx =
  "/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/";

export const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
};

export const transformPrices = (labelValue: any) => {
    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(3) + "M"
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"
    : Math.abs(Number(labelValue));
}