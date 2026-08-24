"use client";

import { useActionState, useState } from "react";

import { createLead } from "../actions";
import styles from "../clientes.module.css";

type CreateLeadState = Awaited<ReturnType<typeof createLead>>;

const initialState: CreateLeadState = {
  status: "idle",
  message: "",
  errors: {},
};

type LeadSource =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "google"
  | "referral"
  | "website"
  | "advertisement"
  | "other";

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors?: string[];
}) {
  if (!errors?.[0]) {
    return null;
  }

  return (
    <p className={styles.fieldError} id={id}>
      {errors[0]}
    </p>
  );
}

export function LeadForm({ today }: { today: string }) {
  const [state, formAction, isPending] = useActionState(
    createLead,
    initialState,
  );
  const [source, setSource] = useState<LeadSource | "">("");

  return (
    <form action={formAction} className={styles.formCard} noValidate>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Site</label>
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

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <span>1</span>
          <div>
            <h2>Dados do cliente</h2>
            <p>Somente o necessário para iniciar o atendimento.</p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Nome do cliente
            </label>
            <input
              aria-describedby={
                state.errors?.name ? "lead-name-error" : undefined
              }
              aria-invalid={Boolean(state.errors?.name)}
              autoComplete="name"
              className={styles.input}
              id="name"
              maxLength={120}
              name="name"
              placeholder="Ex.: Carlos da Silva"
              required
              type="text"
            />
            <FieldError
              errors={state.errors?.name}
              id="lead-name-error"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              WhatsApp/telefone
            </label>
            <input
              aria-describedby={
                state.errors?.phone
                  ? "lead-phone-error lead-phone-help"
                  : "lead-phone-help"
              }
              aria-invalid={Boolean(state.errors?.phone)}
              autoComplete="tel"
              className={styles.input}
              id="phone"
              inputMode="tel"
              maxLength={30}
              name="phone"
              placeholder="(11) 99999-9999"
              required
              type="tel"
            />
            <p className={styles.fieldHint} id="lead-phone-help">
              Se não informar o país, usaremos Brasil (+55).
            </p>
            <FieldError
              errors={state.errors?.phone}
              id="lead-phone-error"
            />
          </div>
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              E-mail <span>Opcional</span>
            </label>
            <input
              aria-describedby={
                state.errors?.email ? "lead-email-error" : undefined
              }
              aria-invalid={Boolean(state.errors?.email)}
              autoCapitalize="none"
              autoComplete="email"
              className={styles.input}
              id="email"
              inputMode="email"
              maxLength={254}
              name="email"
              placeholder="cliente@email.com"
              spellCheck={false}
              type="email"
            />
            <FieldError
              errors={state.errors?.email}
              id="lead-email-error"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="city">
              Cidade
            </label>
            <input
              aria-describedby={
                state.errors?.city ? "lead-city-error" : undefined
              }
              aria-invalid={Boolean(state.errors?.city)}
              autoComplete="address-level2"
              className={styles.input}
              id="city"
              maxLength={120}
              name="city"
              placeholder="Ex.: Campinas"
              required
              type="text"
            />
            <FieldError
              errors={state.errors?.city}
              id="lead-city-error"
            />
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <span>2</span>
          <div>
            <h2>Origem e entrada</h2>
            <p>Isso ajudará a descobrir quais canais geram vendas.</p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="source">
              Origem do lead
            </label>
            <select
              aria-describedby={
                state.errors?.source
                  ? "lead-source-error"
                  : undefined
              }
              aria-invalid={Boolean(state.errors?.source)}
              className={styles.select}
              id="source"
              name="source"
              onChange={(event) =>
                setSource(event.target.value as LeadSource | "")
              }
              required
              value={source}
            >
              <option value="">Selecione a origem</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="referral">Indicação</option>
              <option value="website">Site</option>
              <option value="advertisement">Anúncio</option>
              <option value="other">Outro</option>
            </select>
            <FieldError
              errors={state.errors?.source}
              id="lead-source-error"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="enteredAt">
              Data de entrada
            </label>
            <input
              aria-describedby={
                state.errors?.enteredAt
                  ? "lead-entered-error"
                  : undefined
              }
              aria-invalid={Boolean(state.errors?.enteredAt)}
              className={styles.input}
              defaultValue={today}
              id="enteredAt"
              name="enteredAt"
              required
              type="date"
            />
            <FieldError
              errors={state.errors?.enteredAt}
              id="lead-entered-error"
            />
          </div>
        </div>

        {source === "other" ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sourceDetail">
              Qual foi a origem?
            </label>
            <input
              aria-describedby={
                state.errors?.sourceDetail
                  ? "lead-source-detail-error"
                  : undefined
              }
              aria-invalid={Boolean(state.errors?.sourceDetail)}
              className={styles.input}
              id="sourceDetail"
              maxLength={120}
              name="sourceDetail"
              placeholder="Ex.: Feira regional"
              required
              type="text"
            />
            <FieldError
              errors={state.errors?.sourceDetail}
              id="lead-source-detail-error"
            />
          </div>
        ) : (
          <input name="sourceDetail" type="hidden" value="" />
        )}
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <span>3</span>
          <div>
            <h2>Observações</h2>
            <p>Registre apenas informações úteis para a negociação.</p>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="notes">
            Observações <span>Opcional</span>
          </label>
          <textarea
            aria-describedby={
              state.errors?.notes ? "lead-notes-error" : undefined
            }
            aria-invalid={Boolean(state.errors?.notes)}
            className={styles.textarea}
            id="notes"
            maxLength={5000}
            name="notes"
            placeholder="Ex.: Cliente procura uma piscina para a casa nova e pretende instalar em até 60 dias."
            rows={5}
          />
          <FieldError
            errors={state.errors?.notes}
            id="lead-notes-error"
          />
        </div>
      </section>

      <div className={styles.submitRow}>
        <a className={styles.cancelButton} href="/clientes">
          Cancelar
        </a>

        <button
          className={styles.submitButton}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Salvando lead...
            </>
          ) : (
            <>
              Cadastrar lead
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}