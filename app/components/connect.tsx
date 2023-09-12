import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Fragment } from "react";
import { useConnect } from "wagmi";
import { useIsMounted } from "../hooks";

export default function Connect() {
  const isMounted = useIsMounted();
  const [
    {
      data: { connector, connectors },
      error,
      loading,
    },
    connect,
  ] = useConnect();

  return (
    <>
      <div className="hidden md:block">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              <span>Connect Wallet</span>
              <ChevronDownIcon
                className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 top-8 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-blue-500 ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                {connectors.map((x) => (
                  <Menu.Item key={x.id}>
                    {({ active }) => (
                      <button
                        disabled={isMounted && !x.ready}
                        key={x.name}
                        onClick={() => connect(x)}
                        className={`${
                          active ? "bg-gray-900 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                      >
                        {x.id === "injected"
                          ? isMounted
                            ? x.name
                            : x.id
                          : x.name}
                        {isMounted && !x.ready && " (unsupported)"}
                        {loading && x.name === connector?.name && "…"}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  );
}
