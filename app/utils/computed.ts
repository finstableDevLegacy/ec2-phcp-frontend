export const computedMargin = (
  currentPrice: number,
  price: number,
  type: "buy" | "sell"
) => {
  let value = 0;
  if (type === "buy") value = currentPrice - price;
  if (type === "sell") value = price - currentPrice;
  if (currentPrice !== 0 && price !== 0)
    return ((value * 100) / price).toFixed(2);
  return 0;
};
