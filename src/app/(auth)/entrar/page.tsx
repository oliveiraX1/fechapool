import type { Metadata } from "next";
import Link from "next/link";

import baseStyles from "../cadastro/cadastro.module.css";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar | FechaPool",
  description: "Acesse sua operação comercial no FechaPool.",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    confirmado?: string;
    erro?: string;
  }>;
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
    <span className={baseStyles.checkIcon} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d="m4 10.5 3.5 3.5L16 6" />
      </svg>
    </span>
  );
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const parameters = await searchParams;

  return (
    <main className={baseStyles.page}>
      <div className={baseStyles.ambient} aria-hidden="true">
        <span
          className={`${baseStyles.orb} ${baseStyles.orbOne}`}
        />
        <span
          className={`${baseStyles.orb} ${baseStyles.orbTwo}`}
        />
        <span className={baseStyles.backgroundGrid} />
      </div>

      <section className={baseStyles.storyPanel}>
        <Link className={baseStyles.brand} href="/">
          <span className={baseStyles.logoMark}>
            <LogoMark />
          </span>
          <span>FechaPool</span>
        </Link>

        <div className={baseStyles.storyContent}>
          <p className={baseStyles.eyebrow}>
            Sua operação comercial em movimento
          </p>

          <h1 className={baseStyles.storyTitle}>
            Volte para as negociações que{" "}
            <span>ainda podem fechar.</span>
          </h1>

          <p className={baseStyles.storyCopy}>
            Entre para visualizar os follow-ups do dia, os clientes
            parados e os orçamentos que precisam de atenção.
          </p>

          <div className={baseStyles.previewCard}>
            <div className={baseStyles.previewHeader}>
              <div>
                <p>Fila de recuperação</p>
                <strong>Prioridades de hoje</strong>
              </div>
              <span>Dados demonstrativos</span>
            </div>

            <div className={baseStyles.metricGrid}>
              <article className={baseStyles.metricCard}>
                <span>Precisam de contato</span>
                <strong>12 clientes</strong>
                <small>Ordenados por prioridade</small>
              </article>

              <article className={baseStyles.metricCard}>
                <span>Valor em aberto</span>
                <strong>R$ 187 mil</strong>
                <small className={baseStyles.attention}>
                  3 follow-ups atrasados
                </small>
              </article>
            </div>

            <div className={baseStyles.recoveryRow}>
              <div
                className={baseStyles.recoveryIcon}
                aria-hidden="true"
              >
                ↗
              </div>
              <div>
                <span>Recuperado no mês</span>
                <strong>R$ 42.700</strong>
              </div>
              <small>Métrica auditável</small>
            </div>
          </div>

          <ul className={baseStyles.featureList}>
            <li>
              <CheckIcon />
              Acesso protegido por autenticação
            </li>
            <li>
              <CheckIcon />
              Dados isolados diretamente no banco
            </li>
            <li>
              <CheckIcon />
              Sessões atualizadas automaticamente
            </li>
          </ul>
        </div>

        <p className={baseStyles.demoNotice}>
          Valores exibidos nesta tela são apenas demonstrativos.
        </p>
      </section>

      <section className={baseStyles.formPanel}>
        <div className={baseStyles.formShell}>
          <Link className={baseStyles.mobileBrand} href="/">
            <span className={baseStyles.logoMark}>
              <LogoMark />
            </span>
            <span>FechaPool</span>
          </Link>

          <div className={baseStyles.formHeader}>
            <p className={baseStyles.formKicker}>
              Bem-vindo de volta
            </p>
            <h2>Acesse sua operação</h2>
            <p>
              Entre com o e-mail e a senha usados durante o cadastro.
            </p>
          </div>

          <LoginForm
            confirmationFailed={parameters.erro === "confirmacao"}
            confirmationSucceeded={parameters.confirmado === "1"}
          />

          <Link className={baseStyles.homeLink} href="/">
            ← Voltar para a página inicial
          </Link>
        </div>
      </section>
    </main>
  );
}