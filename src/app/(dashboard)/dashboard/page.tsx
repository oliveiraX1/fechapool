import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { logout } from "./actions";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard | FechaPool",
  description: "Visão comercial da sua empresa no FechaPool.",
  robots: {
    index: false,
    follow: false,
  },
};

type IconName =
  | "dashboard"
  | "leads"
  | "quotes"
  | "followups"
  | "chart"
  | "settings"
  | "logout"
  | "plus"
  | "clock"
  | "wallet"
  | "target"
  | "recovery";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    leads: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 8h5M18.5 5.5v5" />
      </>
    ),
    quotes: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h4M9 12h7M9 16h5" />
      </>
    ),
    followups: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5ZM6 6V4h11v2" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    recovery: (
      <>
        <path d="M4 17 9 12l4 4 7-9" />
        <path d="M15 7h5v5" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function LogoMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path d="M7 21.5C11.5 15 16 13 21 13c4.8 0 8.3 1.8 12 6" />
      <path d="M7 28c4.5-6.5 9-8.5 14-8.5 4.8 0 8.3 1.8 12 6" />
      <circle cx="29.5" cy="10.5" r="3.5" />
    </svg>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: IconName;
  label: string;
  value: string;
  description: string;
  tone: "blue" | "orange" | "green" | "purple";
}) {
  return (
    <article className={styles.metricCard}>
      <div
        className={`${styles.metricIcon} ${styles[`tone${tone}`]}`}
      >
        <Icon name={icon} />
      </div>

      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/entrar");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, organization_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("[dashboard] Perfil autenticado não encontrado.", {
      code: profileError?.code,
    });

    redirect("/entrar");
  }

  const { data: organization, error: organizationError } =
    await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .single();

  if (organizationError || !organization) {
    console.error("[dashboard] Organização não encontrada.", {
      code: organizationError?.code,
    });

    redirect("/entrar");
  }

  const firstName = profile.full_name.split(/\s+/)[0] || "Olá";
  const avatarLetter = firstName.charAt(0).toUpperCase();
  const roleLabel = profile.role === "owner" ? "Dono" : "Vendedor";

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <a className={styles.brand} href="/dashboard">
            <span className={styles.logoMark}>
              <LogoMark />
            </span>
            <span>FechaPool</span>
          </a>

          <div className={styles.organization}>
            <span>Empresa atual</span>
            <strong title={organization.name}>
              {organization.name}
            </strong>
          </div>

          <nav aria-label="Navegação principal">
            <p className={styles.navLabel}>Operação</p>

            <ul className={styles.navList}>
              <li>
                <a
                  aria-current="page"
                  className={styles.navActive}
                  href="/dashboard"
                >
                  <Icon name="dashboard" />
                  Dashboard
                </a>
              </li>
              <li>
                <span className={styles.navDisabled}>
                  <Icon name="leads" />
                  Clientes e leads
                  <small>Em breve</small>
                </span>
              </li>
              <li>
                <span className={styles.navDisabled}>
                  <Icon name="quotes" />
                  Orçamentos
                  <small>Em breve</small>
                </span>
              </li>
              <li>
                <span className={styles.navDisabled}>
                  <Icon name="followups" />
                  Follow-ups
                  <small>Em breve</small>
                </span>
              </li>
            </ul>

            <p className={styles.navLabel}>Gestão</p>

            <ul className={styles.navList}>
              <li>
                <span className={styles.navDisabled}>
                  <Icon name="chart" />
                  Relatórios
                  <small>Em breve</small>
                </span>
              </li>
              <li>
                <span className={styles.navDisabled}>
                  <Icon name="settings" />
                  Configurações
                  <small>Em breve</small>
                </span>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.securityCard}>
            <span className={styles.securityDot} />
            <div>
              <strong>Ambiente protegido</strong>
              <small>Isolamento por empresa ativo</small>
            </div>
          </div>

          <div className={styles.profile}>
            <span className={styles.avatar}>{avatarLetter}</span>

            <div className={styles.profileText}>
              <strong>{profile.full_name}</strong>
              <small>{roleLabel}</small>
            </div>

            <form action={logout}>
              <button
                aria-label="Sair do FechaPool"
                className={styles.logoutButton}
                title="Sair"
                type="submit"
              >
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <a className={styles.mobileBrand} href="/dashboard">
            <span className={styles.logoMark}>
              <LogoMark />
            </span>
            <span>FechaPool</span>
          </a>

          <p className={styles.date}>{formattedDate}</p>

          <button
            className={styles.newLeadButton}
            disabled
            title="Disponível na próxima etapa"
            type="button"
          >
            <Icon name="plus" />
            Novo lead
          </button>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Visão da operação</p>
            <h1>Bom dia, {firstName}.</h1>
            <p>
              Assim que cadastrarmos os primeiros leads, você verá aqui
              quem precisa de acompanhamento e quanto existe em
              negociação.
            </p>
          </div>

          <div className={styles.heroStatus}>
            <span />
            Sistema preparado
          </div>
        </section>

        <section
          aria-label="Indicadores comerciais"
          className={styles.metrics}
        >
          <MetricCard
            description="Nenhum orçamento cadastrado"
            icon="wallet"
            label="Valor em aberto"
            tone="blue"
            value="R$ 0"
          />

          <MetricCard
            description="Sua fila está vazia"
            icon="clock"
            label="Follow-ups hoje"
            tone="orange"
            value="0"
          />

          <MetricCard
            description="Começará após a primeira venda"
            icon="target"
            label="Taxa de conversão"
            tone="purple"
            value="—"
          />

          <MetricCard
            description="Regra transparente e auditável"
            icon="recovery"
            label="Faturamento recuperado"
            tone="green"
            value="R$ 0"
          />
        </section>

        <div className={styles.lowerGrid}>
          <section className={styles.priorityPanel}>
            <header className={styles.panelHeader}>
              <div>
                <p>Prioridades</p>
                <h2>Quem precisa de contato hoje?</h2>
              </div>
              <span>0 pendentes</span>
            </header>

            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Icon name="followups" />
              </div>
              <h3>Nenhum follow-up por enquanto</h3>
              <p>
                Quando adicionarmos clientes e orçamentos, esta área
                mostrará automaticamente as negociações mais urgentes.
              </p>
            </div>
          </section>

          <aside className={styles.nextStep}>
            <p className={styles.nextLabel}>Próxima fundação</p>
            <h2>Clientes e orçamentos</h2>
            <p>
              A próxima etapa permitirá cadastrar um lead rapidamente,
              registrar seu orçamento e definir o primeiro follow-up.
            </p>

            <div className={styles.progress}>
              <div>
                <span>Fundação do sistema</span>
                <strong>Concluída</strong>
              </div>
              <div className={styles.progressTrack}>
                <span />
              </div>
            </div>

            <ul>
              <li>
                <span>✓</span>
                Autenticação segura
              </li>
              <li>
                <span>✓</span>
                Empresa isolada no banco
              </li>
              <li>
                <span>✓</span>
                Permissão de dono registrada
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}