export const PAYMENT_OUTPUT = {
  TOKEN: "Token",
  FIAT: "Fiat",
};

export const parseReturnString = (x: string): "Token" | "Fiat" => {
  if (x === PAYMENT_OUTPUT.TOKEN) {
    return "Token";
  } else {
    return "Fiat";
  }
};
