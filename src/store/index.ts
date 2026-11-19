import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./authSlice";
import { baseApi } from "./api/baseApi";

/** A fresh store per client (Next.js App Router pattern — no module-level singleton). */
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });
  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
