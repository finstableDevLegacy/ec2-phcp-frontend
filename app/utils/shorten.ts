export const shorten = (address: string) =>
  address && address.length >= 20
    ? address.slice(0, 5) + "..." + address.slice(address.length - 4)
    : "";

export const shortenTxLink = (tx: string) =>
  typeof tx === "string" ? shorten(tx.split(/.*tx\//)[1]) : "";

export const TxHash = (tx: string | undefined) =>
  typeof tx === "string" ? tx.split(/.*tx\//)[1] : "";