function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d="M8 12.5c5.2-5 12.8-5 18 0l6 5.8-5 4.8-5.7-5.5a2 2 0 0 0-2.7 0L13 23.1l-5-4.8 6-5.8Z" />
        <path d="M8 24.2c5.2-5 12.8-5 18 0l6 5.8-5 4.8-5.7-5.5a2 2 0 0 0-2.7 0L13 34.8 8 30l6-5.8Z" />
      </svg>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 10 3.2 3.2L15 6.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.8 1.8" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 4.5h11v8h-6l-3.8 3v-3H4.5v-8Z" />
      <path d="M7 8h6M7 10h4" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 14 4-4 3 2 5-6" />
      <path d="M12 6h4v4" />
    </svg>
  );
}

const followUps = [
  {
    initials: "CM",
    name: "Carlos Mendes",
    product: "Piscina 7x3 · R$ 28.900",
    delay: "2 dias sem contato",
    priority: "Alta",
    color: "cyan",
  },
  {
    initials: "AF",
    name: "Ana Ferreira",
    product: "Piscina 6x3 · R$ 21.500",
    delay: "Follow-up previsto hoje",
    priority: "Média",
    color: "violet",
  },
  {
    initials: "RS",
    name: "Rafael Souza",
    product: "Spa premium · R$ 17.800",
    delay: "5 dias sem contato",
    priority: "Alta",
    color: "orange",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="inicio">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <header className="site-header page-shell">
          <a className="brand" href="#inicio" aria-label="FechaPool — início">
            <BrandMark />
            <span>FechaPool</span>
          </a>

          <nav className="main-nav" aria-label="Navegação principal">
            <a href="#beneficios">Benefícios</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#demonstracao">Demonstração</a>
          </nav>

          <a className="header-cta" href="#demonstracao">
            Quero conhecer
            <ArrowIcon />
          </a>
        </header>

        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <div className="eyebrow reveal reveal-one">
              <span className="eyebrow-pulse" />
              Follow-up que recupera vendas
            </div>

            <h1 className="reveal reveal-two">
              Pare de perder vendas porque o follow-up foi
              <span> esquecido.</span>
            </h1>

            <p className="hero-description reveal reveal-three">
              O FechaPool mostra quais orçamentos estão esfriando, organiza
              quem sua equipe precisa chamar hoje e revela quanto faturamento
              foi recuperado.
            </p>

            <div className="hero-actions reveal reveal-four">
              <a className="primary-button" href="#demonstracao">
                Ver demonstração
                <ArrowIcon />
              </a>

              <a className="secondary-button" href="#como-funciona">
                Entender como funciona
              </a>
            </div>

            <ul
              className="hero-proof reveal reveal-five"
              aria-label="Diferenciais"
            >
              <li>
                <CheckIcon />
                Feito para empresas de piscinas
              </li>
              <li>
                <CheckIcon />
                Sem automação clandestina
              </li>
              <li>
                <CheckIcon />
                Poucos cliques
              </li>
            </ul>
          </div>

          <div
            className="dashboard-stage reveal reveal-three"
            id="demonstracao"
          >
            <div className="demo-label">
              <span />
              Dados demonstrativos
            </div>

            <div className="dashboard-window">
              <div className="window-bar">
                <div className="window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <span>Visão geral</span>
                <div className="window-user">OX</div>
              </div>

              <div className="dashboard-body">
                <aside
                  className="dashboard-sidebar"
                  aria-label="Exemplo do menu do sistema"
                >
                  <div className="mini-brand">
                    <BrandMark />
                  </div>
                  <span className="side-item active">
                    <TrendIcon />
                  </span>
                  <span className="side-item">
                    <MessageIcon />
                  </span>
                  <span className="side-item">
                    <ClockIcon />
                  </span>
                </aside>

                <div className="dashboard-content">
                  <div className="dashboard-heading">
                    <div>
                      <span className="overline">
                        Domingo, 23 de agosto
                      </span>
                      <h2>Bom dia, Oliveira.</h2>
                    </div>

                    <button type="button" className="period-button">
                      Este mês <span>⌄</span>
                    </button>
                  </div>

                  <div className="metric-grid">
                    <article className="metric-card metric-highlight">
                      <span>Orçamentos em aberto</span>
                      <strong>R$ 187.400</strong>
                      <small>
                        <b>+12%</b> neste mês
                      </small>
                    </article>

                    <article className="metric-card">
                      <span>Follow-ups hoje</span>
                      <strong>12</strong>
                      <small>
                        <b className="warning">4 atrasados</b>
                      </small>
                    </article>

                    <article className="metric-card">
                      <span>Vendas recuperadas</span>
                      <strong>8</strong>
                      <small>
                        <b>R$ 42.700 recuperados</b>
                      </small>
                    </article>
                  </div>

                  <div className="follow-card">
                    <div className="follow-card-heading">
                      <div>
                        <span className="section-kicker">
                          Prioridade do dia
                        </span>
                        <h3>Quem chamar agora</h3>
                      </div>

                      <span className="today-count">12 hoje</span>
                    </div>

                    <div className="follow-list">
                      {followUps.map((followUp) => (
                        <article className="follow-row" key={followUp.name}>
                          <div
                            className={`avatar avatar-${followUp.color}`}
                          >
                            {followUp.initials}
                          </div>

                          <div className="lead-info">
                            <strong>{followUp.name}</strong>
                            <span>{followUp.product}</span>
                          </div>

                          <div className="lead-delay">
                            <ClockIcon />
                            <span>{followUp.delay}</span>
                          </div>

                          <span
                            className={`priority priority-${followUp.priority.toLowerCase()}`}
                          >
                            {followUp.priority}
                          </span>

                          <button
                            type="button"
                            className="message-button"
                            aria-label={`Preparar mensagem para ${followUp.name}`}
                          >
                            <MessageIcon />
                            Chamar
                          </button>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="recovery-toast" role="status">
              <span className="toast-icon">
                <TrendIcon />
              </span>
              <span>
                <small>Venda recuperada</small>
                <strong>+ R$ 28.900</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits-section" id="beneficios">
        <div className="page-shell">
          <div className="section-heading">
            <span className="section-kicker">
              Controle sem burocracia
            </span>
            <h2>
              O vendedor sabe quem chamar. O dono sabe o que está voltando.
            </h2>
          </div>

          <div className="benefit-grid">
            <article className="benefit-card">
              <span className="benefit-number">01</span>
              <div className="benefit-icon">
                <ClockIcon />
              </div>
              <h3>Nenhum orçamento esquecido</h3>
              <p>
                Follow-ups de hoje e atrasados aparecem em ordem de
                prioridade assim que o vendedor entra.
              </p>
            </article>

            <article className="benefit-card featured">
              <span className="benefit-number">02</span>
              <div className="benefit-icon">
                <MessageIcon />
              </div>
              <h3>Contato rápido pelo WhatsApp</h3>
              <p>
                O sistema prepara a mensagem e abre o WhatsApp. O vendedor
                revisa e decide quando enviar.
              </p>
            </article>

            <article className="benefit-card">
              <span className="benefit-number">03</span>
              <div className="benefit-icon">
                <TrendIcon />
              </div>
              <h3>Receita recuperada com clareza</h3>
              <p>
                Acompanhe vendas retomadas após follow-up com uma regra
                transparente, sem inflar resultados.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="steps-section" id="como-funciona">
        <div className="page-shell steps-grid">
          <div className="section-heading left">
            <span className="section-kicker">Como funciona</span>
            <h2>Da proposta enviada à venda recuperada.</h2>
            <p>
              Um fluxo simples para caber na rotina real da equipe comercial.
            </p>
          </div>

          <ol className="steps-list">
            <li>
              <span>1</span>
              <div>
                <strong>Cadastre o orçamento</strong>
                <p>
                  Valor, produto, vendedor e próxima data de contato.
                </p>
              </div>
            </li>

            <li>
              <span>2</span>
              <div>
                <strong>Veja quem precisa de atenção</strong>
                <p>
                  O FechaPool organiza os contatos do dia por prioridade.
                </p>
              </div>
            </li>

            <li>
              <span>3</span>
              <div>
                <strong>Retome e registre o resultado</strong>
                <p>
                  Abra o WhatsApp, faça o contato e mantenha o histórico.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="final-cta">
        <div className="page-shell final-cta-inner">
          <div>
            <span className="section-kicker">
              O próximo orçamento não precisa esfriar
            </span>
            <h2>
              Transforme follow-up esquecido em venda recuperada.
            </h2>
          </div>

          <a className="primary-button light" href="#demonstracao">
            Ver a prévia do produto
            <ArrowIcon />
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <a
            className="brand"
            href="#inicio"
            aria-label="FechaPool — início"
          >
            <BrandMark />
            <span>FechaPool</span>
          </a>

          <p>Mais orçamentos acompanhados. Mais vendas recuperadas.</p>
          <span>Produto em desenvolvimento</span>
        </div>
      </footer>
    </main>
  );
}