import type { ApiResponse, DashboardRange, DashboardStats } from "@/types";
import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStats, { days: DashboardRange; tz: string }>({
      query: (params) => ({ url: "/dashboard/stats", params }),
      transformResponse: (res: ApiResponse<DashboardStats>) => res.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
