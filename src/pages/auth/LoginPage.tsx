import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";
import { requestPasswordReset } from "@/services/authApi";

export default function LoginPage() {
  const { login, user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/admin";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales invalidas");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetLoading(true);
    setResetMessage(null);
    setResetError(null);
    try {
      const email = resetEmail.trim();
      if (!email) {
        setResetError("Ingresa tu correo para continuar.");
        return;
      }
      const response = await requestPasswordReset(email);
      setResetMessage(response.message ?? "Revisa tu correo para continuar.");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Error al enviar correo");
    } finally {
      setResetLoading(false);
    }
  };

  React.useEffect(() => {
    if (authLoading) return;
    if (token && user) {
      navigate("/admin", { replace: true });
    }
  }, [authLoading, token, user, navigate]);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl border border-black/10 bg-white/80 p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Acceso admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ingresa con tus credenciales para continuar.
        </p>

        {mode === "login" ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-11 rounded-2xl border-black/10"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-2xl border-black/10"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                {error}
              </div>
            ) : null}

            <Button
              className="w-full rounded-2xl h-12 text-white bg-[#c98261] hover:bg-[#b87456]"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              No cerrar sesion
            </label>

            <button
              type="button"
              className="text-sm text-slate-500 underline underline-offset-4"
              onClick={() => {
                setMode("forgot");
                setResetMessage(null);
                setResetError(null);
              }}
            >
              Olvidaste tu contrasena?
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleResetSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                className="h-11 rounded-2xl border-black/10"
                autoComplete="email"
              />
            </div>

            {resetError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                {resetError}
              </div>
            ) : resetMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                {resetMessage}
              </div>
            ) : null}

            <Button
              className="w-full rounded-2xl h-12 text-white bg-[#c98261] hover:bg-[#b87456]"
              disabled={resetLoading}
            >
              {resetLoading ? "Enviando..." : "Enviar correo de recuperacion"}
            </Button>

            <button
              type="button"
              className="text-sm text-slate-500 underline underline-offset-4"
              onClick={() => setMode("login")}
            >
              Volver al inicio de sesion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
