"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import baseStyles from "../cadastro/cadastro.module.css";
import { login } from "./actions";
import styles from "./entrar.module.css";

type LoginState = Awaited<ReturnType<typeof login>>;

const initialState: LoginState = {
  status: "idle",
  message: "",
  errors: {},
};

type LoginFormProps = {
  confirmationSucceeded: boolean;
  confirmationFailed: boolean;
};

function EmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 6.5h18v12H3zM3.5 7l8.5 7 8.5-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2.5" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

export function LoginForm({
  confirmationSucceeded,
  confirmationFailed,
}: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    login,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className={baseStyles.form} noValidate>
      <div className={baseStyles.honeypot} aria-hidden="true">
        <label htmlFor="website">Seu site</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      {confirmationSucceeded ? (
        <div
          className={`${styles.notice} ${styles.noticeSuccess}`}
          role="status"
        >
          <span aria-hidden="true">✓</span>
          <p>E-mail confirmado. Agora você já pode entrar.</p>
        </div>
      ) : null}

      {confirmationFailed ? (
        <div
          className={`${styles.notice} ${styles.noticeError}`}
          role="alert"
        >
          <span aria-hidden="true">!</span>
          <p>
            O link de confirmação é inválido ou já expirou.
          </p>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          className={`${styles.notice} ${styles.noticeError}`}
          role="alert"
        >
          <span aria-hidden="true">!</span>
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={baseStyles.field}>
        <label className={baseStyles.label} htmlFor="email">
          E-mail
        </label>

        <div className={baseStyles.inputWrap}>
          <span className={baseStyles.inputIcon}>
            <EmailIcon />
          </span>
          <input
            aria-describedby={
              state.errors?.email ? "login-email-error" : undefined
            }
            aria-invalid={Boolean(state.errors?.email)}
            autoCapitalize="none"
            autoComplete="email"
            className={baseStyles.input}
            id="email"
            inputMode="email"
            maxLength={254}
            name="email"
            placeholder="voce@suaempresa.com.br"
            required
            spellCheck={false}
            type="email"
          />
        </div>

        {state.errors?.email?.[0] ? (
          <p
            className={baseStyles.fieldError}
            id="login-email-error"
          >
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>

      <div className={baseStyles.field}>
        <label className={baseStyles.label} htmlFor="password">
          Senha
        </label>

        <div className={baseStyles.inputWrap}>
          <span className={baseStyles.inputIcon}>
            <LockIcon />
          </span>
          <input
            aria-describedby={
              state.errors?.password
                ? "login-password-error"
                : undefined
            }
            aria-invalid={Boolean(state.errors?.password)}
            autoComplete="current-password"
            className={`${baseStyles.input} ${baseStyles.passwordInput}`}
            id="password"
            maxLength={128}
            name="password"
            required
            type={showPassword ? "text" : "password"}
          />

          <button
            aria-label={
              showPassword ? "Ocultar senha" : "Mostrar senha"
            }
            className={baseStyles.eyeButton}
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </div>

        {state.errors?.password?.[0] ? (
          <p
            className={baseStyles.fieldError}
            id="login-password-error"
          >
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      <button
        className={baseStyles.submitButton}
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <>
            <span className={baseStyles.spinner} aria-hidden="true" />
            Verificando acesso...
          </>
        ) : (
          <>
            Entrar no FechaPool
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <p className={baseStyles.securityNote}>
        <LockIcon />
        Sessão protegida e acesso separado por empresa.
      </p>

      <p className={styles.signupPrompt}>
        Ainda não possui conta?{" "}
        <Link href="/cadastro">Criar conta gratuitamente</Link>
      </p>
    </form>
  );
}