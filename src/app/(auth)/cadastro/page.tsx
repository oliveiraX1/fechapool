import type { Metadata } from "next";
import Link from "next/link";

import styles from "./cadastro.module.css";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Criar conta | FechaPool",
  description:
    "Crie sua conta no FechaPool e comece a acompanhar os orçamentos que precisam de follow-up.",
  robots: {
    index: false,
    follow: false,
  },
};

function LogoMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path d="M7 21.5C11.5 15 16 13 21 13c4.8 0 8.3 1.8 12 6" />
      <path d="M7 28c4.5-6.5 9-8.5 14-8.5 4.8 0 8.3 1.8 12 6" />
      <circle cx="29.5" cy="10.5" r="3.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className={styles.checkIcon} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d="m4 10.5 3.5 3.5L16 6" />
      </svg>
    </span>
  );
}

export default function SignUpPage() {
  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbOne}`} />
        <span className={`${styles.orb} ${styles.orbTwo}`} />
        <span className={styles.backgroundGrid} />
      </div>

      <section className={styles.storyPanel}>
        <Link className={styles.brand} href="/">
          <span className={styles.logoMark}>
            <LogoMark />
          </span>
          <span>FechaPool</span>
        </Link>

        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>
            Follow-up que protege seu faturamento
          </p>

          <h1 className={styles.storyTitle}>
            Seus orçamentos não precisam{" "}
            <span>esfriar no WhatsApp.</span>
          </h1>

          <p className={styles.storyCopy}>
            Veja quem precisa de contato hoje, retome negociações no
            momento certo e acompanhe quanto dinheiro sua equipe
            recuperou.
          </p>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div>
                <p>Visão comercial</p>
                <strong>Hoje na sua operação</strong>
              </div>
              <span>Dados demonstrativos</span>
            </div>

            <div className={styles.metricGrid}>
              <article className={styles.metricCard}>
                <span>Em negociação</span>
                <strong>R$ 187.400</strong>
                <small>24 orçamentos ativos</small>
              </article>

              <article className={styles.metricCard}>
                <span>Follow-ups hoje</span>
                <strong>12</strong>
                <small className={styles.attention}>
                  3 precisam de atenção
                </small>
              </article>
            </div>

            <div className={styles.recoveryRow}>
              <div className={styles.recoveryIcon} aria-hidden="true">
                ↗
              </div>
              <div>
                <span>Faturamento recuperado</span>
                <strong>R$ 42.700</strong>
              </div>
              <small>+18% no período</small>
            </div>
          </div>

          <ul className={styles.featureList}>
            <li>
              <CheckIcon />
              Cada empresa acessa somente os próprios dados
            </li>
            <li>
              <CheckIcon />
              Prioridades claras para o vendedor todos os dias
            </li>
            <li>
              <CheckIcon />
              Métricas transparentes, sem números inventados
            </li>
          </ul>
        </div>

        <p className={styles.demoNotice}>
          Ambiente inicial de desenvolvimento. Não utilize dados reais
          de clientes ainda.
        </p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formShell}>
          <Link className={styles.mobileBrand} href="/">
            <span className={styles.logoMark}>
              <LogoMark />
            </span>
            <span>FechaPool</span>
          </Link>

          <div className={styles.formHeader}>
            <p className={styles.formKicker}>Comece gratuitamente</p>
            <h2>Crie seu ambiente FechaPool</h2>
            <p>
              Você será o dono da empresa e poderá montar sua equipe
              posteriormente.
            </p>
          </div>

          <SignUpForm />

          <Link className={styles.homeLink} href="/">
            ← Voltar para a página inicial
          </Link>
        </div>
      </section>
    </main>
  );
}