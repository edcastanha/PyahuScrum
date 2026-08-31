import React, { useEffect, useState, useRef } from 'react';
import { Player } from '@remotion/player';
import { PipelineAnimation } from '../components/landing/PipelineAnimation';
import { subscribeToProjectsByStatus } from '../services/pipeline/projectStatusListener';
import styles from './LandingPage.module.css';

// ── Live telemetria do Firestore ────────────────────────────────────────────
function useLiveTelemetry() {
  const [counts, setCounts] = useState({ elicitando: 0, progresso: 0, concluido: 0 });

  useEffect(() => {
    const u1 = subscribeToProjectsByStatus(['TRIAGEM_INICIAL', 'ELICITANDO'], (p) =>
      setCounts((c) => ({ ...c, elicitando: p.length }))
    );
    const u2 = subscribeToProjectsByStatus(['AGUARDANDO_APROVACAO_ESCOPO', 'GERANDO_ADR'], (p) =>
      setCounts((c) => ({ ...c, progresso: p.length }))
    );
    const u3 = subscribeToProjectsByStatus(['CONCLUIDO'], (p) =>
      setCounts((c) => ({ ...c, concluido: p.length }))
    );
    return () => { u1(); u2(); u3(); };
  }, []);

  return counts;
}

// ── Contador animado ────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = () => {
      start += Math.ceil((value - start) / 6) || 1;
      setDisplay(Math.min(start, value));
      if (start < value) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}</span>;
}

// ── Passo do fluxo ──────────────────────────────────────────────────────────
interface FlowStep {
  num: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  badge?: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    num: '01',
    icon: '💡',
    title: 'Você descreve a ideia',
    desc: 'Nome e descrição do projeto. Sem burocracia — sem formulários complexos.',
    color: '#f7c36a',
  },
  {
    num: '02',
    icon: '🔌',
    title: 'API recebe e publica na fila',
    desc: 'POST /projects → Firestore TRIAGEM_INICIAL → RabbitMQ pyahu.pipeline. Retorno imediato.',
    color: '#7c6af7',
    badge: 'Assíncrono',
  },
  {
    num: '03',
    icon: '🤖',
    title: 'OrchestratorAgent elicita',
    desc: 'Até 4 rodadas de perguntas estruturadas Q1..Q5 com ➡️ recomendações — estilo Grill-Me (Matt Pocock).',
    color: '#7c6af7',
    badge: 'ADK',
  },
  {
    num: '04',
    icon: '👤',
    title: 'Você revisa o escopo',
    desc: 'Gemini gera um resumo markdown do projeto. Você aprova ou solicita revisão com feedback.',
    color: '#f87171',
    badge: 'HITL',
  },
  {
    num: '05',
    icon: '📋',
    title: 'ArtifactsAgent gera ADRs + PRD',
    desc: 'Architecture Decision Records e Product Requirements Doc com base no histórico completo.',
    color: '#22d3a0',
    badge: 'ADK',
  },
  {
    num: '06',
    icon: '📝',
    title: 'SpecAgent gera Spec + Tickets',
    desc: 'Especificação técnica detalhada e tickets atômicos ordenados: infra → domínio → API → frontend.',
    color: '#7c6af7',
    badge: 'ADK',
  },
  {
    num: '07',
    icon: '📦',
    title: 'Download do ZIP',
    desc: 'spec.md + prd.md + ADRs + tickets — estrutura canônica pronta para clonar no seu repositório.',
    color: '#22d3a0',
  },
];

// ── Feature card ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon} style={{ background: `${color}1a`, border: `1px solid ${color}40` }}>
        {icon}
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </div>
  );
}

// ── Agente card ─────────────────────────────────────────────────────────────
function AgentCard({
  icon, name, role, desc, color,
}: { icon: string; name: string; role: string; desc: string; color: string }) {
  return (
    <div className={styles.agentCard} style={{ borderColor: `${color}30` }}>
      <div className={styles.agentTop}>
        <div className={styles.agentIcon} style={{ background: `${color}1a`, border: `1px solid ${color}50` }}>
          {icon}
        </div>
        <div>
          <p className={styles.agentName}>{name}</p>
          <p className={styles.agentRole} style={{ color }}>{role}</p>
        </div>
      </div>
      <p className={styles.agentDesc}>{desc}</p>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const telemetry = useLiveTelemetry();
  const playerRef = useRef(null);

  return (
    <div className={styles.page}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>⚡</span>
          <span>Pyahu Scrum</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#fluxo">Fluxo</a>
          <a href="#agentes">Agentes</a>
          <a href="#telemetria">Telemetria</a>
        </div>
        <a href="/login" className={styles.navCta}>Acessar app →</a>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>
          <span>🏆</span> Google ADK Hackathon · Categoria Taskmaster
        </div>
        <h1 className={styles.heroTitle}>
          Da ideia ao código<br />
          <span className={styles.heroAccent}>em minutos, não semanas</span>
        </h1>
        <p className={styles.heroSub}>
          3 agentes Google ADK colaborando para transformar qualquer ideia em spec técnica,
          ADRs, PRD e tickets de desenvolvimento — via elicitação interativa com o Gemini.
        </p>
        <div className={styles.heroCtas}>
          <a href="/login" className={styles.ctaPrimary}>Criar meu primeiro projeto →</a>
          <a href="#fluxo" className={styles.ctaSecondary}>Ver como funciona</a>
        </div>

        {/* Telemetria live */}
        <div className={styles.heroStats}>
          {[
            { label: 'Em elicitação', value: telemetry.elicitando, color: '#7c6af7', dot: true },
            { label: 'Em progresso', value: telemetry.progresso,  color: '#f7c36a', dot: true },
            { label: 'Concluídos',   value: telemetry.concluido,  color: '#22d3a0', dot: false },
          ].map((s) => (
            <div key={s.label} className={styles.heroStat}>
              {s.dot && <span className={styles.liveDot} style={{ background: s.color }} />}
              <span className={styles.statNum} style={{ color: s.color }}>
                <AnimatedNumber value={s.value} />
              </span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
          <div className={styles.liveTag}>
            <span className={styles.livePulse} />
            LIVE · Firestore
          </div>
        </div>
      </section>

      {/* ── Vídeo Remotion — Pipeline Animado ── */}
      <section id="fluxo" className={styles.videoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Visualização do Pipeline</span>
          <h2 className={styles.sectionTitle}>Do input ao artefato — em tempo real</h2>
          <p className={styles.sectionSub}>
            Cada nó representa um componente real do sistema. As setas mostram o fluxo de dados
            entre os agentes ADK, o RabbitMQ e o Firestore.
          </p>
        </div>
        <div className={styles.playerWrapper}>
          <Player
            ref={playerRef}
            component={PipelineAnimation}
            durationInFrames={160}
            compositionWidth={1280}
            compositionHeight={480}
            fps={30}
            style={{ width: '100%', borderRadius: '16px', border: '1px solid #2a2a50' }}
            controls
            loop
            autoPlay
          />
        </div>
      </section>

      {/* ── Fluxo passo a passo ── */}
      <section className={styles.flowSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Fluxo Detalhado</span>
          <h2 className={styles.sectionTitle}>7 passos, 3 agentes, 1 ZIP</h2>
        </div>
        <div className={styles.flowGrid}>
          {FLOW_STEPS.map((step) => (
            <div key={step.num} className={styles.flowStep}>
              <div className={styles.flowNum} style={{ color: step.color, borderColor: `${step.color}40` }}>
                {step.num}
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowHeader}>
                  <span className={styles.flowIcon}>{step.icon}</span>
                  <h3 className={styles.flowTitle}>{step.title}</h3>
                  {step.badge && (
                    <span className={styles.flowBadge} style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}40` }}>
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className={styles.flowDesc}>{step.desc}</p>
              </div>
              {step.num !== '07' && <div className={styles.flowConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Agentes ADK ── */}
      <section id="agentes" className={styles.agentsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Multi-Agentes ADK 2.8</span>
          <h2 className={styles.sectionTitle}>3 especialistas, 1 pipeline</h2>
          <p className={styles.sectionSub}>
            Cada agente tem uma responsabilidade isolada e um output key definido no ADK.
            O SequentialAgent orquestra a colaboração.
          </p>
        </div>
        <div className={styles.agentsGrid}>
          <AgentCard
            icon="🤖"
            name="OrchestratorAgent"
            role="LlmAgent · Elicitação"
            desc="Conduz rounds de perguntas estruturadas Q1..Q5 com ➡️ recomendações, no estilo /grilling de Matt Pocock. Máximo de 4 rodadas, sinaliza pronto: true quando tem contexto suficiente."
            color="#7c6af7"
          />
          <AgentCard
            icon="📋"
            name="ArtifactsAgent"
            role="LlmAgent · ADRs + PRD"
            desc="Recebe o histórico completo da elicitação e gera Architecture Decision Records e Product Requirements Document com base exclusivamente nas respostas do usuário."
            color="#22d3a0"
          />
          <AgentCard
            icon="📝"
            name="SpecAgent"
            role="LlmAgent · Spec + Tickets"
            desc="Consome a saída do ArtifactsAgent e gera a especificação técnica detalhada e os tickets de desenvolvimento atômicos (máx. 15), ordenados: infra → domínio → API → frontend."
            color="#f7c36a"
          />
        </div>

        {/* Diagrama de colaboração */}
        <div className={styles.collabDiagram}>
          <div className={styles.collabNode} style={{ borderColor: '#7c6af740' }}>
            <span>🤖</span><span>OrchestratorAgent</span>
          </div>
          <div className={styles.collabArrow}>→ aprovação →</div>
          <div className={styles.collabNode} style={{ borderColor: '#22d3a040' }}>
            <span>📋</span><span>ArtifactsAgent</span>
          </div>
          <div className={styles.collabArrow}>→</div>
          <div className={styles.collabNode} style={{ borderColor: '#f7c36a40' }}>
            <span>📝</span><span>SpecAgent</span>
          </div>
          <div className={styles.collabArrow}>→</div>
          <div className={styles.collabNode} style={{ borderColor: '#22d3a040', background: '#22d3a010' }}>
            <span>📦</span><span>ZIP</span>
          </div>
        </div>
      </section>

      {/* ── Telemetria live ── */}
      <section id="telemetria" className={styles.telemetrySection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Telemetria ao vivo · Firestore</span>
          <h2 className={styles.sectionTitle}>Estado do sistema agora</h2>
          <p className={styles.sectionSub}>
            Dados reais do Firestore via <code>onSnapshot</code> — atualizam sem recarregar.
          </p>
        </div>
        <div className={styles.telemetryGrid}>
          {[
            { label: 'Em Elicitação',  value: telemetry.elicitando, icon: '💬', color: '#7c6af7', desc: 'aguardando respostas do usuário' },
            { label: 'Em Progresso',   value: telemetry.progresso,  icon: '⚙️', color: '#f7c36a', desc: 'aguardando aprovação ou gerando docs' },
            { label: 'Concluídos',     value: telemetry.concluido,  icon: '✅', color: '#22d3a0', desc: 'artefatos disponíveis para download' },
          ].map((item) => (
            <div key={item.label} className={styles.telCard} style={{ borderColor: `${item.color}30` }}>
              <div className={styles.telIcon} style={{ background: `${item.color}15` }}>{item.icon}</div>
              <div className={styles.telNum} style={{ color: item.color }}>
                <AnimatedNumber value={item.value} />
              </div>
              <div className={styles.telLabel}>{item.label}</div>
              <div className={styles.telDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>Pronto para acelerar seu próximo projeto?</h2>
        <p className={styles.ctaSub}>
          3 agentes ADK + Gemini transformam sua ideia em documentação técnica completa.
        </p>
        <a href="/login" className={styles.ctaPrimary} style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
          Criar meu projeto agora →
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <span>⚡ Pyahu Scrum</span>
          <span className={styles.footerSep}>·</span>
          <span>Google ADK Hackathon 2025</span>
          <span className={styles.footerSep}>·</span>
          <span>Categoria Taskmaster</span>
        </div>
        <div className={styles.footerRight}>
          <a href="https://github.com/edcastanha/PyahuScrum" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="/pipeline/elicitacao">Pipeline</a>
          <a href="https://api-homolog.pyahuscrum.adbfn6.easypanel.host/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
