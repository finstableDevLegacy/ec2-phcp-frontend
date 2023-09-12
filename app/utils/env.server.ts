function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    ALCHEMY_ID: process.env.ALCHEMY_ID,
    ETHERSCAN_ID: process.env.ETHERSCAN_API_KEY,
    INFURA_ID: process.env.INFURA_ID,
    TRANSCRYPT_BACKEND: process.env.TRANSCRYPT_BACKEND,
    EXCHANGE_RATE_BACKEND: process.env.EXCHANGE_RATE_BACKEND,
    BASE_URL: process.env.BASE_URL,
    BITKUB_NEXT_ID: process.env.BITKUB_NEXT_ID,
    ENV: process.env.ENV,
    DNS_KEY: process.env.DNS_KEY,
    API_KEY: process.env.API_KEY,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}

export { getEnv };
