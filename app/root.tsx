import { providers } from "ethers";
import type { MetaFunction } from "@remix-run/node";
import { LoaderFunction } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

import styles from "./styles/app.css";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css";
import toastCss from "react-toastify/dist/ReactToastify.css";

import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

import { Connector, Provider, Chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { getEnv } from "./utils/env.server";
import i18n from "~/i18n.server";
import { useChangeLanguage } from "remix-i18next";
import { useTranslation } from "react-i18next";
import useAppStore from "./stores/app-store";
import { useEffect } from "react";
import { getChains } from "./config/network";
import * as Sentry from "@sentry/remix";

export type LoaderData = {
  chains: Chain[];
  defaultChain: Chain;
  ENV: ReturnType<typeof getEnv>;
  locale: string;
};

if (process.env.NEXT_PUBLIC_OVERRIDED_NODE_ENV === "production") {
  Sentry.init({
    dsn: ENV.DNS_KEY,
    tracesSampleRate: 1,
  });
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: nProgressStyles },
    { rel: "stylesheet", href: toastCss },
  ];
}

export const loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);
  let { chains, defaultChain } = getChains(process.env.ENV!);

  const data: LoaderData = {
    chains,
    defaultChain,
    ENV: getEnv(),
    locale,
  };
  return data;
};

export const meta: MetaFunction = () => {
  return { title: "PHCpay" };
};

export default function App() {
  // Get server side data
  const { chains, defaultChain, ENV, locale } = useLoaderData<LoaderData>();

  const transition = useTransition();
  useEffect(() => {
    // when the state is idle then we can to complete the progress bar
    if (transition.state === "idle") NProgress.done();
    // and when it's something else it means it's either submitting a form or
    // waiting for the loaders of the next location so we start it
    else NProgress.start();
  }, [transition.state]);

  // Setup translations
  let { i18n } = useTranslation();
  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

  const setDefaultChain = useAppStore((state) => state.setDefaultChain);
  setDefaultChain(defaultChain.id);

  // Set up connectors
  type ConnectorsConfig = { chainId?: number };
  const connectors = ({ chainId }: ConnectorsConfig) => {
    return [
      new InjectedConnector({
        chains,
        options: { shimDisconnect: true },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          infuraId: process.env.INFURA_ID,
          qrcode: true,
          rpc: {
            1: process.env.ALCHEMY_ID
              ? `https://mainnet.infura.io/v3/${process.env.ALCHEMY_ID}`
              : "https://mainnet.infura.io/v3/UuZaRWkN8i9K1_RvrtssdRaRn6MTZ49_",
            4: process.env.ALCHEMY_ID
              ? `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`
              : "https://eth-rinkeby.alchemyapi.io/v2/UuZaRWkN8i9K1_RvrtssdRaRn6MTZ49_",
            56: "https://bsc-dataseed.binance.org/",
            97: "https://data-seed-prebsc-1-s2.binance.org:8545/",
            137: "https://polygon-rpc.com",
            80001: "https://matic-mumbai.chainstacklabs.com",
          },
        },
      }),
    ];
  };

  // Set up providers
  type ProviderConfig = { chainId?: number; connector?: Connector };
  // const isChainSupported = (chainId?: number) =>
  //   chains.some((x) => x.id === chainId);

  const provider = ({ chainId }: ProviderConfig) => {
    if (chainId) {
      return new providers.Web3Provider(window.ethereum as any);
    }
    return new providers.JsonRpcProvider(defaultChain.rpcUrls[0]);
  };

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/assets/phc_logo.png" />
        <Meta />
        <Links />
        <script> var global = global || window; </script>
      </head>
      <body className="relative flex h-screen w-full flex-col overflow-auto">
        <QueryClientProvider client={queryClient}>
          <Provider
            autoConnect
            connectors={connectors}
            provider={provider}
            // webSocketProvider={webSocketProvider}
          >
            <Outlet />
          </Provider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="relative flex h-screen w-full flex-col overflow-auto">
        <div className="flex min-h-screen items-center justify-center ">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">
              Oops! Something went wrong.
            </h1>
            <p className=" whitespace-pre-line">{error.message}</p>
          </div>
        </div>
      </body>
    </html>
  );
}
