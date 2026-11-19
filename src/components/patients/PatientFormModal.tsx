"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CONDITION_META, GENDER_LABEL } from "@/lib/constants";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import { useAddDoctorPatientMutation } from "@/store/api/doctorApi";
import { useUpdatePatientMutation } from "@/store/api/patientApi";
import { GENDERS, PATIENT_CONDITIONS, type Patient, type PatientInput } from "@/types";

const today = () => format(new Date(), "yyyy-MM-dd");

const patientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  age: z.coerce
    .number({ invalid_type_error: "Age is required" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(130, "Age looks too high"),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Select a gender" }) }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address")]),
  condition: z.enum(PATIENT_CONDITIONS),
  diagnosis: z.string().trim().max(300, "Keep the diagnosis under 300 characters"),
  admittedAt: z
    .string()
    .min(1, "Admission date is required")
    .refine((v) => v <= today(), "Admission date cannot be in the future"),
});
type PatientForm = z.input<typeof patientSchema>;
type PatientValues = z.output<typeof patientSchema>;

const emptyForm = (): PatientForm => ({
  name: "",
  age: "" as unknown as number,
  gender: "" as PatientForm["gender"],
  phone: "",
  email: "",
  condition: "stable",
  diagnosis: "",
  admittedAt: today(),
});

/** "2026-11-18" (local day) -> ISO timestamp at local midday, avoids TZ day-shifts. */
const toIso = (day: string) => new Date(`${day}T12:00:00`).toISOString();

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Create mode: the doctor the patient is added under. */
  doctorId?: string;
  doctorName?: string;
  /** Edit mode: the patient being edited. */
  patient?: Patient | null;
}

export function PatientFormModal({ open, onClose, doctorId, doctorName, patient }: PatientFormModalProps) {
  const isEdit = Boolean(patient);
  const [addPatient, addState] = useAddDoctorPatientMutation();
  const [updatePatient, updateState] = useUpdatePatientMutation();
  const saving = addState.isLoading || updateState.isLoading;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<PatientForm, unknown, PatientValues>({ resolver: zodResolver(patientSchema), defaultValues: emptyForm() });

  useEffect(() => {
    if (!open) return;
    reset(
      patient
        ? {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email ?? "",
            condition: patient.condition,
            diagnosis: patient.diagnosis ?? "",
            admittedAt: format(new Date(patient.admittedAt), "yyyy-MM-dd"),
          }
        : emptyForm(),
    );
  }, [open, patient, reset]);

  const onSubmit = async (values: PatientValues) => {
    const body: PatientInput = { ...values, admittedAt: toIso(values.admittedAt) };
    try {
      if (patient) {
        await updatePatient({ id: patient._id, body }).unwrap();
        toast.success("Patient updated");
      } else if (doctorId) {
        await addPatient({ doctorId, body }).unwrap();
        toast.success("Patient added");
      }
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field as keyof PatientForm, { message }));
      if (!Object.keys(fieldErrors).length) toast.error(getErrorMessage(err));
    }
  };

  const fieldProps = (name: keyof PatientForm) => ({
    id: `patient-${name}`,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `patient-${name}-error` : undefined,
    ...register(name),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit patient" : "Add patient"}
      description={isEdit ? "Update the patient's details and current condition." : doctorName ? `New patient under ${doctorName}.` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" loading={saving} disabled={isEdit && !isDirty}>
            {isEdit ? "Save changes" : "Add patient"}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Field label="Full name" htmlFor="patient-name" error={errors.name?.message} required className="sm:col-span-4">
          <Input placeholder="John Smith" autoComplete="off" {...fieldProps("name")} />
        </Field>
        <Field label="Age" htmlFor="patient-age" error={errors.age?.message} required className="sm:col-span-2">
          <Input type="number" inputMode="numeric" min={0} max={130} placeholder="42" {...fieldProps("age")} />
        </Field>
        <Field label="Gender" htmlFor="patient-gender" error={errors.gender?.message} required className="sm:col-span-2">
          <Select {...fieldProps("gender")}>
            <option value="" disabled>
              Select…
            </option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[g]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Condition" htmlFor="patient-condition" error={errors.condition?.message} required className="sm:col-span-2">
          <Select {...fieldProps("condition")}>
            {PATIENT_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_META[c].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Admitted on" htmlFor="patient-admittedAt" error={errors.admittedAt?.message} required className="sm:col-span-2">
          <Input type="date" max={today()} {...fieldProps("admittedAt")} />
        </Field>
        <Field label="Phone" htmlFor="patient-phone" error={errors.phone?.message} required className="sm:col-span-3">
          <Input type="tel" placeholder="+880 1712 345678" autoComplete="off" {...fieldProps("phone")} />
        </Field>
        <Field label="Email" htmlFor="patient-email" error={errors.email?.message} hint="Optional" className="sm:col-span-3">
          <Input type="email" placeholder="john@mail.com" autoComplete="off" {...fieldProps("email")} />
        </Field>
        <Field label="Diagnosis / notes" htmlFor="patient-diagnosis" error={errors.diagnosis?.message} hint="Optional" className="sm:col-span-6">
          <Textarea placeholder="e.g. Hypertension, follow-up in 2 weeks" rows={3} {...fieldProps("diagnosis")} />
        </Field>
      </form>
    </Modal>
  );
}
