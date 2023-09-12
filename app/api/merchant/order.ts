import { FetchOrderByIdResponseType } from "~/type/api/fetch-order-by-id-response.type";
import { api } from "../base-url";

export const fetchOrderById = async (
  id: string
): Promise<FetchOrderByIdResponseType> => {
  const { data } = await api().get(`orders?filter=id||$eq||${id}`);
  const [order] = data;
  return order;
};
