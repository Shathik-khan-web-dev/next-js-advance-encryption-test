"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/client/store/store";
import { Provider } from "react-redux";

export default function SessionProviderWrapper({ children }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </ThemeProvider>
      </SessionProvider>
    </Provider>
  );
}
