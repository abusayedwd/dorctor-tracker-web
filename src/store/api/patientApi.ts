import { compact } from "@/lib/utils";
import type { ApiResponse, Paginated, Patient, PatientInput, PatientListParams } from "@/types";
import { baseApi } from "./baseApi";

const doctorIdOf = (p: Patient) => (typeof p.doctor === "string" ? p.doctor : p.doctor._id);

export const patientApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPatients: build.query<Paginated<Patient>, PatientListParams>({
      query: (params) => ({ url: "/patients", params: compact(params) }),
      transformResponse: (res: ApiResponse<Patient[]>) => ({ items: res.data, meta: res.meta! }),
      providesTags: (result) => [
        { type: "Patient", id: "LIST" },
        ...(result?.items.map((p) => ({ type: "Patient" as const, id: p._id })) ?? []),
      ],
    }),

    updatePatient: build.mutation<Patient, { id: string; body: Partial<PatientInput> }>({
      query: ({ id, body }) => ({ url: `/patients/${id}`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<Patient>) => res.data,
      invalidatesTags: (result, _e, { id }) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
        "Dashboard",
        ...(result ? [{ type: "Doctor" as const, id: doctorIdOf(result) }] : []),
      ],
    }),

    /**
     * Optimistic delete: the row disappears instantly from every cached
     * patient list; if the request fails the patch is rolled back.
     */
    deletePatient: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches = patientApi.util
          .selectInvalidatedBy(getState(), [{ type: "Patient", id }])
          .filter((entry) => entry.endpointName === "getPatients")
          .map(({ originalArgs }) =>
            dispatch(
              patientApi.util.updateQueryData("getPatients", originalArgs as PatientListParams, (draft) => {
                draft.items = draft.items.filter((p) => p._id !== id);
                draft.meta.total = Math.max(0, draft.meta.total - 1);
              }),
            ),
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: [{ type: "Patient", id: "LIST" }, { type: "Doctor", id: "LIST" }, "Dashboard"],
    }),
  }),
});

export const { useGetPatientsQuery, useUpdatePatientMutation, useDeletePatientMutation } = patientApi;
