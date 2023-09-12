import { CheckCircleIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchOrderById } from "~/api/merchant/order";
import LoadingIcon from "~/components/loading-icon";
import { FetchOrderByIdResponseType } from "~/type/api/fetch-order-by-id-response.type";

const SuccessCashierToken = ({
  amountOutFromEvent,
  orderIdURL,
  orderId,
}: {
  amountOutFromEvent: number;
  orderIdURL: string;
  orderId: string;
}) => {
  const { t } = useTranslation("neworder");
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<FetchOrderByIdResponseType>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedOrder = await fetchOrderById(orderId);
        setOrder(fetchedOrder);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderReceiveToken = () => {
    const getReceiveAmount = (): string => {
      if (amountOutFromEvent) {
        return Number(amountOutFromEvent).toFixed(2);
      }
      if (order?.amountOut) {
        return Number(order.amountOut).toFixed(2);
      }
      return "";
    };
    if (order?.tokenSymbol && getReceiveAmount()) {
      return (
        <p className="mt-3 text-sm text-white">
          {t("you_recevied")} {getReceiveAmount()} {order.tokenSymbol}
        </p>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-52 items-center justify-center">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <CheckCircleIcon className="h-32 text-primary-yellow" />
      <p className="text-xl font-bold text-white">{t("order_completed")}</p>
      {renderReceiveToken()}
      <Link
        className="mt-3 text-sm font-light text-primary-yellow underline underline-offset-1"
        to={`/merchant/order/id?${orderIdURL}`}
      >
        {t("view_detail")}
      </Link>
    </div>
  );
};

export default SuccessCashierToken;
