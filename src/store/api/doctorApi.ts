import { compact } from "@/lib/utils";
import type {
  ApiResponse,
  Doctor,
  DoctorFilterOptions,
  DoctorInput,
  DoctorListParams,
  Paginated,
  Patient,
  PatientInput,
  PatientListParams,
} from "@/types";
import { baseApi } from "./baseApi";

const toPage = <T>(res: ApiResponse<T[]>): Paginated<T> => ({ items: res.data, meta: res.meta! });

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDoctors: build.query<Paginated<Doctor>, DoctorListParams>({
      query: (params) => ({ url: "/doctors", params: compact(params) }),
      transformResponse: toPage<Doctor>,
      providesTags: (result) => [
        { type: "Doctor", id: "LIST" },
        ...(result?.items.map((d) => ({ type: "Doctor" as const, id: d._id })) ?? []),
      ],
    }),

    getDoctor: build.query<Doctor, string>({
      query: (id) => `/doctors/${id}`,
      transformResponse: (res: ApiResponse<Doctor>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Doctor", id }],
    }),

    getDoctorFilters: build.query<DoctorFilterOptions, void>({
      query: () => "/doctors/filters",
      transformResponse: (res: ApiResponse<DoctorFilterOptions>) => res.data,
      providesTags: ["DoctorFilters"],
      keepUnusedDataFor: 300,
    }),

    createDoctor: build.mutation<Doctor, DoctorInput>({
      query: (body) => ({ url: "/doctors", method: "POST", body }),
      transformResponse: (res: ApiResponse<Doctor>) => res.data,
      invalidatesTags: [{ type: "Doctor", id: "LIST" }, "DoctorFilters", "Dashboard"],
    }),

    updateDoctor: build.mutation<Doctor, { id: string; body: Partial<DoctorInput> }>({
      query: ({ id, body }) => ({ url: `/doctors/${id}`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<Doctor>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Doctor", id },
        { type: "Doctor", id: "LIST" },
        { type: "Patient", id: "LIST" }, // patient rows show the doctor's name
        "DoctorFilters",
        "Dashboard",
      ],
    }),

    deleteDoctor: build.mutation<{ id: string; deletedPatients: number }, string>({
      query: (id) => ({ url: `/doctors/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiResponse<{ id: string; deletedPatients: number }>) => res.data,
      invalidatesTags: [{ type: "Doctor", id: "LIST" }, { type: "Patient", id: "LIST" }, "DoctorFilters", "Dashboard"],
    }),

    getDoctorPatients: build.query<Paginated<Patient>, { doctorId: string; params: PatientListParams }>({
      query: ({ doctorId, params }) => ({ url: `/doctors/${doctorId}/patients`, params: compact(params) }),
      transformResponse: toPage<Patient>,
      providesTags: (result) => [
        { type: "Patient", id: "LIST" },
        ...(result?.items.map((p) => ({ type: "Patient" as const, id: p._id })) ?? []),
      ],
    }),

    addDoctorPatient: build.mutation<Patient, { doctorId: string; body: PatientInput }>({
      query: ({ doctorId, body }) => ({ url: `/doctors/${doctorId}/patients`, method: "POST", body }),
      transformResponse: (res: ApiResponse<Patient>) => res.data,
      invalidatesTags: (_r, _e, { doctorId }) => [
        { type: "Patient", id: "LIST" },
        { type: "Doctor", id: doctorId },
        { type: "Doctor", id: "LIST" },
        "Dashboard",
      ],
    }),

    removeDoctorPatient: build.mutation<{ id: string }, { doctorId: string; patientId: string }>({
      query: ({ doctorId, patientId }) => ({ url: `/doctors/${doctorId}/patients/${patientId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { doctorId }) => [
        { type: "Patient", id: "LIST" },
        { type: "Doctor", id: doctorId },
        { type: "Doctor", id: "LIST" },
        "Dashboard",
      ],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorQuery,
  useGetDoctorFiltersQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetDoctorPatientsQuery,
  useAddDoctorPatientMutation,
  useRemoveDoctorPatientMutation,
} = doctorApi;
