import { api } from "../base-url";

export const apiUpdateDealerOrderId = async (
  id: string,
  dealerOrderId: string
) => {
  return await api().put(`/orders/info/updateidfiat/${id}`, {
    id: dealerOrderId,
  });
};
