import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_BASE } from "@/lib/constants";
import { refreshSession } from "@/lib/session";
import { sessionEnded, sessionStarted } from "../authSlice";
import type { RootState } from "../index";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"];

/**
 * On a 401, transparently refresh the session once and retry the original
 * request. If refreshing fails the session is ended and the guard redirects
 * to /login.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status !== 401 || AUTH_ENDPOINTS.some((p) => url.startsWith(p))) {
    return result;
  }

  const session = await refreshSession();
  if (session) {
    api.dispatch(sessionStarted(session));
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    api.dispatch(sessionEnded());
  }
  return result;
};

/**
 * Single API slice; feature endpoints are added with `injectEndpoints` in
 * their own files (code-split, one cache, one middleware).
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Doctor", "Patient", "Dashboard", "DoctorFilters"],
  // Serve cached data for 60s when a list is revisited, refetch on reconnect.
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
