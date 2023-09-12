import Countdown from "./countdown";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { formatNumber } from "~/utils/format";
import { encryptString } from "~/utils/crypto";

export default function OrderCardPending({
  detail,
}: {
  detail: {
    amountOut: number;
    createdAt: string;
    deadline: string;
    id: number;
    merchantAddress: string;
    payerAddress: string;
    status: string;
    token_id: string;
    updatedAt: string;
    content: string;
  };
}) {
  const navigate = useNavigate();
  const [isCountDownFinish, setIsCountDownFinish] = useState(false);
  const content = JSON.parse(detail.content);
  const handleProceed = async () => {
    const url = `orderId=${detail.id}&price=${content.price}&receiveToken=${
      content.receiveToken
    }&receiveTokenValue=${content.receiveTokenValue}&exchangeRate=${
      content.exchangeRate
    }&currency=${content.currency}&merchant=${
      detail.merchantAddress
    }&deadline=${Math.floor(new Date(detail.deadline).getTime() / 1000)}`;

    const encryptParams = encryptString(url);
    navigate(`/merchant/neworder?${encryptParams}`);
  };

  return (
    <div>
      <div className="w-full rounded-t-lg bg-white py-5 px-10 shadow-sm md:rounded-lg">
        <div className="flex w-full flex-col items-center justify-between sm:flex-row">
          <p className="m-0 p-0 text-3xl font-bold text-yellow-600">
            Order #{detail.id}
          </p>
          <p className="m-0 p-0 capitalize text-gray-700">
            <Countdown
              message="Remaining time"
              deadline={(new Date(detail.deadline).getTime() / 1000).toString()}
              isCountDownFinish={isCountDownFinish}
              setIsCountDownFinish={setIsCountDownFinish}
            />
          </p>
        </div>
        <div className="flex items-end justify-between">
          <table className="mt-5 w-full max-w-md flex-1 md:ml-10">
            <tbody>
              <tr>
                <td className="font-bold">Merchant Address</td>
                <td className="text-right">
                  {detail.merchantAddress.slice(0, 10)}...
                  {detail.merchantAddress.slice(
                    detail.merchantAddress.length - 10,
                    detail.merchantAddress.length
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-bold">Amount</td>
                <td className="text-right">
                  {formatNumber(detail.amountOut)}{" "}
                  {content && content.receiveToken}
                </td>
              </tr>
            </tbody>
          </table>
          <div
            onClick={handleProceed}
            className="ml-5 hidden cursor-pointer rounded-lg bg-yellow-600 p-3 px-5 text-white shadow-lg md:block"
          >
            Proceed
          </div>
        </div>
      </div>
      <div
        onClick={handleProceed}
        className="block cursor-pointer rounded-b-lg bg-yellow-600 p-3 px-5 text-center text-white shadow-lg md:hidden"
      >
        Proceed
      </div>
    </div>
  );
}
