export const genMetamaskDeepLink = (url: string) => {
  const dappURL = url.replace(/http.*:\/\//, "");
  return `https://metamask.app.link/dapp/${dappURL}`;
};
