import { string } from "yup";
import { PaymentOutput } from "~/enums/payment-output";
import { OrderResponse } from "~/type/api-response";
import { MerchantOrder } from "~/type/order";

export const mapMerchantOrder = (order: OrderResponse) => {
  const content = JSON.parse(order.content!) as MerchantOrder;

  const result: MerchantOrder = {
    orderId: order.id.toString(),
    price: content.price,
    merchant: order.merchantAddress,
    merchantName: content.merchantName,
    receiveToken: content.receiveToken,
    receiveTokenValue: content.receiveTokenValue,
    exchangeRate: content.exchangeRate,
    currency: content.currency,
    deadline: Math.floor(new Date(order.deadline).getTime() / 1000).toString(),
    receiveFiatValue: content.receiveFiatValue,
    fee: order.fee,
    networkId: content.networkId,
    transactionHash: order.transactionHash,
    status: order.status,
    payerAddress: order.payerAddress,
    payAmount: order.payAmount?.toString(),
    payToken: order.payToken,
    manager: order.manager,
    updatedAt: order.updatedAt,
    paymentOutput: order?.paymentOutput as PaymentOutput,
    discount_percentage: content?.discount_percentage,
    withdrawOrder: order?.withdrawOrder,
    amountOut: Number(content.receiveTokenValue),
  };

  return result;
};

export const isOrderPassDeadline = (deadline: string) => {
  return +new Date() > Math.floor(new Date(deadline).getTime());
};
