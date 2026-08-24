import type { Metadata } from "next";
import Link from "next/link";

import { requireAppUser } from "@/lib/auth/require-app-user";

import styles from "./clientes.module.css";

export const metadata: Metadata = {
  title: "Clientes e leads | FechaPool",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

const sourceLabels = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  referral: "Indicação",
  website: "Site",
  advertisement: "Anúncio",
  other: "Outro",
};

type ClientsPageProps = {
  searchParams: Promise<{
    criado?: string;
    pagina?: string;
  }>;
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length === 13) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  if (digits.startsWith("55") && digits.length === 12) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  return phone;
}

export default async function ClientsPage({
  searchParams,
}: ClientsPageProps) {
  const parameters = await searchParams;
  const requestedPage = Number.parseInt(parameters.pagina ?? "1", 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const { supabase, organization } = await requireAppUser();

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: leads,
    count,
    error,
  } = await supabase
    .from("leads")
    .select(
      "id, name, phone, email, city, source, source_detail, entered_at, created_at",
      { count: "exact" },
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[leads/list] Não foi possível listar leads.", {
      code: error.code,
    });

    throw new Error("Não foi possível carregar os clientes.");
  }

  const totalLeads = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalLeads / PAGE_SIZE));

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link className={styles.brand} href="/dashboard">
            <span className={styles.brandMark}>FP</span>
            <span>FechaPool</span>
          </Link>

          <div className={styles.topActions}>
            <span className={styles.companyBadge}>
              {organization.name}
            </span>
            <Link className={styles.dashboardLink} href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {parameters.criado === "1" ? (
          <div className={styles.successNotice} role="status">
            <span aria-hidden="true">✓</span>
            Lead cadastrado com sucesso.
          </div>
        ) : null}

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Base comercial</p>
            <h1>Clientes e leads</h1>
            <p>
              Todos os contatos que podem gerar uma negociação para sua
              empresa.
            </p>
          </div>

          <Link className={styles.primaryButton} href="/clientes/novo">
            <span aria-hidden="true">+</span>
            Novo lead
          </Link>
        </section>

        <section className={styles.stats}>
          <article className={styles.statCard}>
            <span>Leads ativos</span>
            <strong>{totalLeads}</strong>
            <small>Sem incluir arquivados</small>
          </article>

          <article className={styles.statCard}>
            <span>Página atual</span>
            <strong>
              {currentPage}/{totalPages}
            </strong>
            <small>Até {PAGE_SIZE} registros por página</small>
          </article>

          <article className={styles.statCard}>
            <span>Próxima etapa</span>
            <strong>Orçamentos</strong>
            <small>Valor, status e follow-up</small>
          </article>
        </section>

        <section className={styles.listPanel}>
          <header className={styles.panelHeader}>
            <div>
              <p>Lista atual</p>
              <h2>Leads ativos</h2>
            </div>

            <span className={styles.countBadge}>
              {totalLeads}{" "}
              {totalLeads === 1 ? "registro" : "registros"}
            </span>
          </header>

          {leads && leads.length > 0 ? (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contato</th>
                      <th>Cidade</th>
                      <th>Origem</th>
                      <th>Entrada</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className={styles.leadName}>
                            <span>
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{lead.name}</strong>
                              <small>Sem orçamento</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className={styles.leadContact}>
                            <strong>{formatPhone(lead.phone)}</strong>
                            <small>{lead.email || "Sem e-mail"}</small>
                          </div>
                        </td>

                        <td>{lead.city}</td>

                        <td>
                          <span className={styles.sourceBadge}>
                            {sourceLabels[
                              lead.source as keyof typeof sourceLabels
                            ] ?? lead.source}
                          </span>
                        </td>

                        <td className={styles.dateCell}>
                          {new Intl.DateTimeFormat("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          }).format(new Date(lead.entered_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <nav
                  aria-label="Paginação dos clientes"
                  className={styles.pagination}
                >
                  {currentPage > 1 ? (
                    <Link href={`/clientes?pagina=${currentPage - 1}`}>
                      ← Anterior
                    </Link>
                  ) : (
                    <span>← Anterior</span>
                  )}

                  <strong>
                    Página {currentPage} de {totalPages}
                  </strong>

                  {currentPage < totalPages ? (
                    <Link href={`/clientes?pagina=${currentPage + 1}`}>
                      Próxima →
                    </Link>
                  ) : (
                    <span>Próxima →</span>
                  )}
                </nav>
              ) : null}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>+</div>
              <h3>Cadastre seu primeiro lead</h3>
              <p>
                Comece com um contato fictício para testar o fluxo sem
                utilizar dados de clientes reais.
              </p>
              <Link
                className={styles.primaryButton}
                href="/clientes/novo"
              >
                Cadastrar lead de teste
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}