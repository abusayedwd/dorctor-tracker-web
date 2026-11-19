import type { ApiResponse, Session } from "@/types";
import { sessionEnded, sessionStarted } from "../authSlice";
import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<Session, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (res: ApiResponse<Session>) => res.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(sessionStarted(data));
      },
    }),
    logout: build.mutation<null, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // End the local session even if the network call fails, and drop every
        // cached query so no data leaks into the next session.
        try {
          await queryFulfilled;
        } catch {
          /* ignore */
        } finally {
          dispatch(sessionEnded());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
