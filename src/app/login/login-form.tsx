"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-bold text-[#24364d]"
        >
          Usuário
        </label>
        <div className="relative">
          <UserRound
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#738399]"
          />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
            className="h-12 w-full rounded-xl border border-[#d7e0ea] bg-white pl-11 pr-4 text-sm text-[#17283e] shadow-sm outline-none transition placeholder:text-[#96a3b3] focus:border-[#00a8c0] focus:ring-4 focus:ring-[#00b8cf]/10"
            placeholder="Digite seu usuário"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-bold text-[#24364d]"
        >
          Senha
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#738399]"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-xl border border-[#d7e0ea] bg-white pl-11 pr-12 text-sm text-[#17283e] shadow-sm outline-none transition placeholder:text-[#96a3b3] focus:border-[#00a8c0] focus:ring-4 focus:ring-[#00b8cf]/10"
            placeholder="Digite sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#738399] transition hover:bg-[#eef3f8] hover:text-[#153a73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8cf]"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div
        aria-live="polite"
        className="min-h-5 text-sm font-semibold text-[#b42338]"
      >
        {state.error}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b1f3a] px-5 text-sm font-extrabold text-white shadow-lg shadow-[#0b1f3a]/15 transition hover:bg-[#153a73] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00b8cf]/25 disabled:cursor-wait disabled:opacity-70"
      >
        {pending && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        {pending ? "Verificando acesso..." : "Entrar no dashboard"}
      </button>
    </form>
  );
}
