import AES from "crypto-js/aes";
import { enc } from "crypto-js";

const secret = "bkffrontend" ?? process.env.SESSION_SECRET;

export const encryptString = (str: string) => {
  const ciphertext = AES.encrypt(str, secret);
  return encodeURIComponent(ciphertext.toString());
};

export const decryptString = (str: string) => {
  const decodedStr = decodeURIComponent(str);
  return AES.decrypt(decodedStr, secret).toString(enc.Utf8);
};

export const parseEncryptURL = (url: string) => {
  let newUrl = new URL(url);
  const decryptParams = decryptString(newUrl.search.slice(1)); // remove ? from params
  const parseURL = new URL(
    `${newUrl.origin}${newUrl.pathname}?${decryptParams}`
  );
  return { parseURL, decryptParams };
};
