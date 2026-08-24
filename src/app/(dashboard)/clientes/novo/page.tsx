import type { Metadata } from "next";
import Link from "next/link";

import { requireAppUser } from "@/lib/auth/require-app-user";

import styles from "../clientes.module.css";
import { LeadForm } from "./lead-form";

export const metadata: Metadata = {
  title: "Novo lead | FechaPool",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewLeadPage() {
  const { organization } = await requireAppUser();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

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
            <Link className={styles.dashboardLink} href="/clientes">
              Voltar aos clientes
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.formShell}>
        <div className={styles.formHeader}>
          <p className={styles.eyebrow}>Nova oportunidade</p>
          <h1>Cadastrar lead</h1>
          <p>
            Registre o essencial agora. O orçamento e o follow-up serão
            adicionados em seguida.
          </p>
        </div>

        <LeadForm today={today} />
      </div>
    </main>
  );
}