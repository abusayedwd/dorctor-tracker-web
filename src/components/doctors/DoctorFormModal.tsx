"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import { useCreateDoctorMutation, useGetDoctorFiltersQuery, useUpdateDoctorMutation } from "@/store/api/doctorApi";
import type { Doctor } from "@/types";

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  specialization: z.string().trim().min(2, "Specialization is required").max(100),
  hospital: z.string().trim().min(2, "Hospital is required").max(150),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});
type DoctorForm = z.infer<typeof doctorSchema>;

const EMPTY: DoctorForm = { name: "", specialization: "", hospital: "", phone: "", email: "" };

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When given, the modal edits this doctor; otherwise it creates one. */
  doctor?: Doctor | null;
}

export function DoctorFormModal({ open, onClose, doctor }: DoctorFormModalProps) {
  const isEdit = Boolean(doctor);
  const [createDoctor, createState] = useCreateDoctorMutation();
  const [updateDoctor, updateState] = useUpdateDoctorMutation();
  const { data: options } = useGetDoctorFiltersQuery(undefined, { skip: !open });
  const saving = createState.isLoading || updateState.isLoading;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<DoctorForm>({ resolver: zodResolver(doctorSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      reset(
        doctor
          ? { name: doctor.name, specialization: doctor.specialization, hospital: doctor.hospital, phone: doctor.phone, email: doctor.email }
          : EMPTY,
      );
    }
  }, [open, doctor, reset]);

  const onSubmit = async (values: DoctorForm) => {
    try {
      if (doctor) {
        await updateDoctor({ id: doctor._id, body: values }).unwrap();
        toast.success("Doctor updated");
      } else {
        await createDoctor(values).unwrap();
        toast.success("Doctor created");
      }
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field as keyof DoctorForm, { message }));
      // Duplicate email comes back as 409 without field details.
      if ((err as { status?: number }).status === 409) setError("email", { message: getErrorMessage(err) });
      if (!Object.keys(fieldErrors).length) toast.error(getErrorMessage(err));
    }
  };

  const fieldProps = (name: keyof DoctorForm) => ({
    id: `doctor-${name}`,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `doctor-${name}-error` : undefined,
    ...register(name),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit doctor" : "Add doctor"}
      description={isEdit ? "Update the doctor's profile information." : "Create a new doctor profile."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" loading={saving} disabled={isEdit && !isDirty}>
            {isEdit ? "Save changes" : "Create doctor"}
          </Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="doctor-name" error={errors.name?.message} required className="sm:col-span-2">
          <Input placeholder="Dr. Jane Doe" autoComplete="off" {...fieldProps("name")} />
        </Field>
        <Field label="Specialization" htmlFor="doctor-specialization" error={errors.specialization?.message} required>
          <Input placeholder="Cardiology" list="specialization-options" autoComplete="off" {...fieldProps("specialization")} />
          <datalist id="specialization-options">
            {options?.specializations.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>
        <Field label="Hospital" htmlFor="doctor-hospital" error={errors.hospital?.message} required>
          <Input placeholder="City General Hospital" list="hospital-options" autoComplete="off" {...fieldProps("hospital")} />
          <datalist id="hospital-options">
            {options?.hospitals.map((h) => <option key={h} value={h} />)}
          </datalist>
        </Field>
        <Field label="Phone" htmlFor="doctor-phone" error={errors.phone?.message} required>
          <Input type="tel" placeholder="+880 1712 345678" autoComplete="off" {...fieldProps("phone")} />
        </Field>
        <Field label="Email" htmlFor="doctor-email" error={errors.email?.message} required>
          <Input type="email" placeholder="jane.doe@hospital.com" autoComplete="off" {...fieldProps("email")} />
        </Field>
      </form>
    </Modal>
  );
}
