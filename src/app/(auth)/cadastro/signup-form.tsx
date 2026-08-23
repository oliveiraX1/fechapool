"use client";

import { useActionState, useState } from "react";

import { signUp } from "./actions";
import styles from "./cadastro.module.css";

type FormState = Awaited<ReturnType<typeof signUp>>;

const initialState: FormState = {
  status: "idle",
  message: "",
  errors: {},
};

type FieldErrorProps = {
  id: string;
  errors?: string[];
};

function FieldError({ id, errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className={styles.fieldError} id={id}>
      {errors[0]}
    </p>
  );
}

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-7.5 9a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 21V6.5L12 3v18M12 9h8v12M7.5 9h1M7.5 13h1M7.5 17h1M15.5 13h1M15.5 17h1M2 21h20" />
    </svg>
  );
}

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

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUp,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  if (state.status === "success") {
    return (
      <section className={styles.successCard} aria-live="polite">
        <div className={styles.successIcon}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m5 12.5 4.2 4.2L19 7" />
          </svg>
        </div>

        <p className={styles.successEyebrow}>Falta apenas um passo</p>
        <h2 className={styles.successTitle}>Confirme seu e-mail</h2>
        <p className={styles.successText}>{state.message}</p>
        <p className={styles.successHint}>
          Confira também as pastas de spam e promoções.
        </p>

        <a className={styles.backLink} href="/cadastro">
          Usar outro e-mail
        </a>
      </section>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Seu site</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      {state.status === "error" ? (
        <div className={styles.alert} role="alert">
          <span aria-hidden="true">!</span>
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fullName">
            Seu nome
          </label>

          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <PersonIcon />
            </span>
            <input
              aria-describedby={
                state.errors?.fullName ? "fullName-error" : undefined
              }
              aria-invalid={Boolean(state.errors?.fullName)}
              autoComplete="name"
              className={styles.input}
              id="fullName"
              maxLength={120}
              name="fullName"
              placeholder="Ex.: Carlos Oliveira"
              required
              type="text"
            />
          </div>

          <FieldError
            errors={state.errors?.fullName}
            id="fullName-error"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="companyName">
            Nome da empresa
          </label>

          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <CompanyIcon />
            </span>
            <input
              aria-describedby={
                state.errors?.companyName
                  ? "companyName-error"
                  : undefined
              }
              aria-invalid={Boolean(state.errors?.companyName)}
              autoComplete="organization"
              className={styles.input}
              id="companyName"
              maxLength={120}
              name="companyName"
              placeholder="Ex.: Piscinas Horizonte"
              required
              type="text"
            />
          </div>

          <FieldError
            errors={state.errors?.companyName}
            id="companyName-error"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          E-mail profissional
        </label>

        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>
            <EmailIcon />
          </span>
          <input
            aria-describedby={
              state.errors?.email ? "email-error" : undefined
            }
            aria-invalid={Boolean(state.errors?.email)}
            autoCapitalize="none"
            autoComplete="email"
            className={styles.input}
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

        <FieldError errors={state.errors?.email} id="email-error" />
      </div>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Crie uma senha
          </label>

          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <LockIcon />
            </span>
            <input
              aria-describedby={
                state.errors?.password
                  ? "password-error password-help"
                  : "password-help"
              }
              aria-invalid={Boolean(state.errors?.password)}
              autoComplete="new-password"
              className={`${styles.input} ${styles.passwordInput}`}
              id="password"
              maxLength={128}
              minLength={10}
              name="password"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={
                showPassword ? "Ocultar senha" : "Mostrar senha"
              }
              className={styles.eyeButton}
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              <EyeIcon hidden={showPassword} />
            </button>
          </div>

          <FieldError
            errors={state.errors?.password}
            id="password-error"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirme a senha
          </label>

          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <LockIcon />
            </span>
            <input
              aria-describedby={
                state.errors?.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
              aria-invalid={Boolean(state.errors?.confirmPassword)}
              autoComplete="new-password"
              className={styles.input}
              id="confirmPassword"
              maxLength={128}
              minLength={10}
              name="confirmPassword"
              required
              type={showPassword ? "text" : "password"}
            />
          </div>

          <FieldError
            errors={state.errors?.confirmPassword}
            id="confirmPassword-error"
          />
        </div>
      </div>

      <p className={styles.passwordHelp} id="password-help">
        Use 10 ou mais caracteres, com maiúscula, minúscula, número e
        símbolo.
      </p>

      <button
        className={styles.submitButton}
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Criando ambiente seguro...
          </>
        ) : (
          <>
            Criar minha conta
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <p className={styles.securityNote}>
        <LockIcon />
        Sua empresa receberá um ambiente separado e protegido.
      </p>
    </form>
  );
}