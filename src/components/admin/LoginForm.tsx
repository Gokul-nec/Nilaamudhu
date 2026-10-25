"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { getClientAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useLang } from "@/components/Providers";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { lang, t } = useLang();
  const logT = t.admin.login;
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError(null);
    setResetMessage(null);
    if (!isFirebaseConfigured()) {
      setError("Firebase credentials are not configured yet in .env.local.");
      return;
    }

    const auth = getClientAuth();
    if (!auth) {
      setError("Unable to initialize Firebase Authentication client.");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, v.email, v.password);
      const idToken = await cred.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to establish admin session.");
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError((err as Error)?.message || "Failed to sign in.");
      }
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    const email = getValues("email")?.trim();
    if (!email) {
      setError("Please type your admin email address above first, then click 'Forgot / Change password?'.");
      return;
    }

    const auth = getClientAuth();
    if (!auth) {
      setError("Unable to initialize Firebase Authentication client.");
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage(`A password change link was sent to ${email}. Check your inbox to set a new password.`);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        setError("No admin account was found with that email address.");
      } else {
        setError((err as Error)?.message || "Failed to send password reset email.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1 block font-semibold">
          {logT.email}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          className="field"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p role="alert" className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block font-semibold">
          {logT.password}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="field pr-11"
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={isResetting}
          className="text-xs font-semibold text-forest-700 hover:text-forest-900 hover:underline"
        >
          {isResetting
            ? (lang === "ta" ? "மின்னஞ்சல் அனுப்புகிறது..." : "Sending reset email...")
            : (lang === "ta" ? "கடவுச்சொல் மறந்துவிட்டதா?" : "Forgot / Change password?")}
        </button>
      </div>

      {resetMessage && (
        <div role="status" className="flex items-start gap-2 rounded-xl bg-forest-50 p-3 text-sm text-forest-900 border border-forest-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-forest-700" />
          <span>{resetMessage}</span>
        </div>
      )}

      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? logT.signingIn : logT.signIn}
      </button>
    </form>
  );
}
