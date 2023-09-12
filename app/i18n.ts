//en
import cashier from "../public/locales/en/cashier.json";
import common from "../public/locales/en/common.json";
import history from "../public/locales/en/history.json";
import index from "../public/locales/en/index.json";
import login from "../public/locales/en/login.json";
import managerMember from "../public/locales/en/manager-member.json";
import manager from "../public/locales/en/manager.json";
import merchant from "../public/locales/en/merchant.json";
import neworder from "../public/locales/en/neworder.json";
import order from "../public/locales/en/order.json";
import pay from "../public/locales/en/pay.json";
import wallet from "../public/locales/en/wallet.json";

//th
import cashierTH from "../public/locales/th/cashier.json";
import commonTH from "../public/locales/th/common.json";
import historyTH from "../public/locales/th/history.json";
import indexTH from "../public/locales/th/index.json";
import loginTH from "../public/locales/th/login.json";
import managerMemberTH from "../public/locales/th/manager-member.json";
import managerTH from "../public/locales/th/manager.json";
import merchantTH from "../public/locales/th/merchant.json";
import neworderTH from "../public/locales/th/neworder.json";
import orderTH from "../public/locales/th/order.json";
import payTH from "../public/locales/th/pay.json";
import walletTH from "../public/locales/th/wallet.json";

export default {
  // This is the list of languages your application supports
  supportedLngs: ["th", "en"],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: "en",
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS: "common",
  // Disabling suspense is recommended
  react: { useSuspense: false },
  resources: {
    en: {
      cashier,
      common,
      history,
      index,
      login,
      "manager-member": managerMember,
      manager,
      merchant,
      neworder,
      order,
      pay,
      wallet,
    },
    th: {
      cashier: cashierTH,
      common: commonTH,
      history: historyTH,
      index: indexTH,
      login: loginTH,
      "manager-member": managerMemberTH,
      manager: managerTH,
      merchant: merchantTH,
      neworder: neworderTH,
      order: orderTH,
      pay: payTH,
      wallet: walletTH,
    },
  },
};
