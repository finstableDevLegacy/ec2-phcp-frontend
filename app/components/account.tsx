import { useAccount, useBalance } from "wagmi";

export default function Account() {
  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data, error, loading }, getBalance] = useBalance({
    addressOrName: accountData?.address,
    formatUnits: "ether",
    skip: true,
  });

  if (!accountData) return <div>No account connected</div>;
  if (error) return <div>Error fetching balance</div>;

  return (
    <div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => disconnect()}
          className="group relative mt-10 flex max-w-xs justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Disconnect from {accountData?.connector?.name}
        </button>

        <p>Address: {accountData?.address}</p>
        <div className="flex items-center">
          <p className=" w-72">
            Balance:{" "}
            {loading
              ? `Fetching...`
              : `${data?.formatted || ""} ${data?.symbol || ""}`}
          </p>
          <button
            onClick={() => getBalance()}
            className="group relative flex max-w-xs justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Fetch
          </button>
        </div>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  return (
    <div>
      <h2>We couldn't find that page!</h2>
    </div>
  );
}
