export default function OrderSelect({ orderType, setOrderType }: any) {
  return (
    <div className="my-7 flex h-5 items-center justify-center rounded-full">
      <div
        onClick={() => {
          setOrderType("pending");
        }}
        className={`cursor-pointer rounded-l-full  p-1.5 px-4 font-medium  ${
          orderType === "pending"
            ? "bg-primary-yellow text-white"
            : "bg-gray-300 text-black"
        }`}
      >
        On Going
      </div>
      <div
        onClick={() => {
          setOrderType("history");
        }}
        className={`cursor-pointer rounded-r-full  p-1.5 px-4 font-medium  ${
          orderType === "history"
            ? "bg-primary-yellow text-white"
            : "bg-gray-300 text-black"
        }`}
      >
        History
      </div>
    </div>
  );
}
