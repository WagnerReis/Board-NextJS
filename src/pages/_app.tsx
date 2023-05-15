import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Header } from "../components/Header";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import "../styles/global.scss";

const initialOptions = {
  "client-id": process.env.NEXT_PUBLIC_CLIENT_ID as string,
  currency: "BRL",
  intent: "capture"
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <PayPalScriptProvider options={initialOptions}>
        <Header />
        <Component {...pageProps} />
      </PayPalScriptProvider>
    </SessionProvider>
  );
}
