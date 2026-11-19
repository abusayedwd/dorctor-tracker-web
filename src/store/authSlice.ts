import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@/types";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: User | null;
  /** Access token lives only in memory (never localStorage) -> not exposed to persistent XSS theft. */
  accessToken: string | null;
  status: AuthStatus;
}

const initialState: AuthState = { user: null, accessToken: null, status: "idle" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<Session>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
    },
    sessionEnded(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
    },
  },
});

export const { sessionStarted, sessionEnded } = authSlice.actions;
export default authSlice.reducer;
