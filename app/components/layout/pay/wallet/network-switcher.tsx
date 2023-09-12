import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "@remix-run/react";
import { PayLoaderData } from "~/routes/pay";
import NetworkSelector from "../../../network-selector";

export default function NetworkSwitcher() {
  const { t } = useTranslation("common");
  const { chains } = useLoaderData<PayLoaderData>();

  return (
    <div className="flex flex-col justify-center">
      <Menu as="div" className="relative mt-3 inline-block text-left">
        <Menu.Button className="inline-flex w-full justify-center rounded-lg bg-primary-yellow px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <span>{t("please_change_network")}</span>
          <ChevronDownIcon
            className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
            aria-hidden="true"
          />
        </Menu.Button>
        <NetworkSelector chains={chains} />
      </Menu>
    </div>
  );
}
