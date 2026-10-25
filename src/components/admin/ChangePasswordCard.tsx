"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { changeAdminPasswordAction } from "@/app/admin/actions";
import { useLang } from "@/components/Providers";

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function ChangePasswordCard() {
  const { t } = useLang();
  const st = t.admin.settings;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordValues) => {
    setServerError(null);
    setSuccessMessage(null);

    const res = await changeAdminPasswordAction(data.password);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }

    setSuccessMessage(st.passwordUpdated);
    reset();
  };

  return (
    <section className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-forest-800" />
        <h2 className="text-2xl font-semibold text-forest-900">{st.changePasswordTitle}</h2>
      </div>
      <p className="text-sm text-muted">{st.changePasswordHint}</p>

      {serverError && (
        <p role="alert" className="rounded-xl bg-[#f6dcd6] p-3 text-sm font-semibold text-danger">
          {serverError}
        </p>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-forest-50 border border-forest-200 p-3 text-sm font-semibold text-forest-900"
        >
          <CheckCircle2 className="h-4 w-4 text-forest-700" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
        <div>
          <label htmlFor="new-password" className="mb-1 block font-semibold text-sm">
            {st.newPassword}
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="field pr-11 text-sm"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-forest-900 rounded-full hover:bg-forest-50 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p role="alert" className="mt-1 text-sm text-danger">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1 block font-semibold text-sm">
            {st.confirmPassword}
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              className="field pr-11 text-sm"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-forest-900 rounded-full hover:bg-forest-50 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="mt-1 text-sm text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary !min-h-10 text-sm">
          {isSubmitting ? "..." : st.updatePassword}
        </button>
      </form>
    </section>
  );
}
