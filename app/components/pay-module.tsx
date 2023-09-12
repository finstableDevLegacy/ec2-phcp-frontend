import { Link } from "@remix-run/react";

export default function PayModule() {
  return (
    <>
      <div className="mt-20 flex h-full w-full items-center justify-center">
        <div className="flex h-96 w-full max-w-3xl justify-center rounded-xl bg-white shadow-xl">
          Wallet
        </div>
      </div>
      <div className="mt-20 flex h-full w-full items-center justify-center">
        <Link to={"/pay/scanqr"}>
          <button className="h-30 w-40 rounded-md border border-sky-500 bg-white">
            Scan QR
          </button>
        </Link>
      </div>
    </>
  );
}
