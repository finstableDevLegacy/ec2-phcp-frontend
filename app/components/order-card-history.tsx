import { formatNumber } from "~/utils/format";

import { useNavigate } from "@remix-run/react";
import { encryptString } from "~/utils/crypto";
export default function OrderCardHistory({
  location,
  detail,
}: {
  location: string;
  detail: {
    amountOut: number;
    createdAt: string;
    deadline: string;
    id: number;
    merchantAddress: string;
    payerAddress: string;
    payAmount: string;
    status: string;
    token_id: string;
    updatedAt: string;
    content: string;
  };
}) {
  const navitage = useNavigate();
  const handleViewDetail = async () => {
    const url = `orderId=${detail.id}`;

    const encryptParams = encryptString(url);
    let redirectTo = "";

    if (location === "/pay/order") {
      redirectTo = "/pay/order";
    } else {
      redirectTo = "/merchant/order";
    }

    navitage(`${redirectTo}/id?${encryptParams}`);
  };

  return (
    <div>
      <div className="w-full rounded-t-lg bg-white py-5 px-10 shadow-sm md:rounded-lg">
        <div className="flex w-full flex-col items-center justify-between sm:flex-row">
          <p className="m-0 p-0 text-3xl font-bold text-blue-500">
            Order #{detail.id}
          </p>
          <p className="m-0 p-0 capitalize text-gray-700">
            <span className="font-bold">Status:</span> {detail.status}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <table className="mt-5 w-full max-w-md flex-1 md:ml-10">
            <tbody>
              <tr>
                <td className="font-bold">Merchant Address</td>
                <td className="text-right">
                  {detail.merchantAddress.slice(0, 4)}...
                  {detail.merchantAddress.slice(
                    detail.merchantAddress.length - 4,
                    detail.merchantAddress.length
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-bold">Amount</td>
                <td className="text-right">
                  {formatNumber(detail.amountOut)} THB
                </td>
              </tr>
            </tbody>
          </table>
          <div
            onClick={handleViewDetail}
            className="ml-5 hidden cursor-pointer rounded-lg bg-blue-500 p-3 px-5 text-white shadow-lg md:block"
          >
            View Detail
          </div>
        </div>
      </div>
      <div
        onClick={handleViewDetail}
        className="block cursor-pointer rounded-b-lg bg-blue-500 p-3 px-5 text-center text-white shadow-lg md:hidden"
      >
        View Detail
      </div>
    </div>
  );
}
