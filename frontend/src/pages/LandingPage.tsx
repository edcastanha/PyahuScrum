import React, { useEffect, useState, useRef } from 'react';
import { Player } from '@remotion/player';
import { PipelineAnimation } from '../components/landing/PipelineAnimation';
import { subscribeToProjectsByStatus } from '../services/pipeline/projectStatusListener';
import styles from './LandingPage.module.css';

// ── i18n ────────────────────────────────────────────────────────────────────

type Lang = 'pt' | 'en' | 'es';

const I18N = {
  pt: {
    navFluxo: 'Fluxo',
    navAgentes: 'Agentes',
    navTelemetria: 'Telemetria',
    navCta: 'Acessar app →',
    heroBadge: '🏆 Google ADK Hackathon · Categoria Taskmaster',
    heroTitle1: 'Da ideia ao código',
    heroTitle2: 'em minutos, não semanas',
    heroSub: '3 agentes Google ADK colaborando para transformar qualquer ideia em spec técnica, ADRs, PRD e tickets de desenvolvimento — via elicitação interativa com o Gemini.',
    ctaPrimary: 'Criar meu primeiro projeto →',
    ctaSecondary: 'Ver como funciona',
    statElicitando: 'Em elicitação',
    statProgresso: 'Em progresso',
    statConcluido: 'Concluídos',
    videoTag: 'Visualização do Pipeline',
    videoTitle: 'Do input ao artefato — em tempo real',
    videoSub: 'Cada nó representa um componente real do sistema. As setas mostram o fluxo de dados entre os agentes ADK, o RabbitMQ e o Firestore.',
    flowTag: 'Fluxo Detalhado',
    flowTitle: '7 passos, 3 agentes, 1 ZIP',
    agentsTag: 'Multi-Agentes ADK 2.8',
    agentsTitle: '3 especialistas, 1 pipeline',
    agentsSub: 'Cada agente tem uma responsabilidade isolada e um output key definido no ADK. O SequentialAgent orquestra a colaboração.',
    telTag: 'Telemetria ao vivo · Firestore',
    telTitle: 'Estado do sistema agora',
    telSub: 'Dados reais do Firestore via onSnapshot — atualizam sem recarregar.',
    telElicitando: 'Em Elicitação',
    telProgresso: 'Em Progresso',
    telConcluido: 'Concluídos',
    telDescElicitando: 'aguardando respostas do usuário',
    telDescProgresso: 'aguardando aprovação ou gerando docs',
    telDescConcluido: 'artefatos disponíveis para download',
    ctaFinalTitle: 'Pronto para acelerar seu próximo projeto?',
    ctaFinalSub: '3 agentes ADK + Gemini transformam sua ideia em documentação técnica completa.',
    ctaFinalBtn: 'Criar meu projeto agora →',
    footerHackathon: 'Google ADK Hackathon 2025',
    footerCategory: 'Categoria Taskmaster',
    footerPipeline: 'Pipeline',
    steps: [
      { num: '01', icon: '💡', title: 'Você descreve a ideia',           desc: 'Nome e descrição do projeto. Sem burocracia — sem formulários complexos.', color: '#f7c36a' },
      { num: '02', icon: '🔌', title: 'API recebe e publica na fila',     desc: 'POST /projects → Firestore TRIAGEM_INICIAL → RabbitMQ pyahu.pipeline. Retorno imediato.', color: '#7c6af7', badge: 'Assíncrono' },
      { num: '03', icon: '🤖', title: 'OrchestratorAgent elicita',        desc: 'Até 4 rodadas de perguntas Q1..Q5 com ➡️ recomendações — entrevista interativa com o Gemini.', color: '#7c6af7', badge: 'ADK' },
      { num: '04', icon: '👤', title: 'Você revisa o escopo',             desc: 'Gemini gera um resumo markdown do projeto. Você aprova ou solicita revisão com feedback.', color: '#f87171', badge: 'HITL' },
      { num: '05', icon: '📋', title: 'ArtifactsAgent gera ADRs + PRD',  desc: 'Architecture Decision Records e Product Requirements Doc com base no histórico completo.', color: '#22d3a0', badge: 'ADK' },
      { num: '06', icon: '📝', title: 'SpecAgent gera Spec + Tickets',    desc: 'Especificação técnica detalhada e tickets atômicos: infra → domínio → API → frontend.', color: '#7c6af7', badge: 'ADK' },
      { num: '07', icon: '📦', title: 'Download do ZIP',                  desc: 'spec.md + prd.md + ADRs + tickets — estrutura canônica pronta para o seu repositório.', color: '#22d3a0' },
    ],
    agents: [
      { icon: '🤖', name: 'OrchestratorAgent', role: 'LlmAgent · Elicitação',   desc: 'Conduz rounds de perguntas Q1..Q5 com ➡️ recomendações. Máximo de 4 rodadas, sinaliza pronto: true quando tem contexto suficiente.', color: '#7c6af7' },
      { icon: '📋', name: 'ArtifactsAgent',    role: 'LlmAgent · ADRs + PRD',   desc: 'Recebe o histórico completo e gera Architecture Decision Records e Product Requirements Document.', color: '#22d3a0' },
      { icon: '📝', name: 'SpecAgent',          role: 'LlmAgent · Spec + Tickets', desc: 'Consome a saída do ArtifactsAgent e gera spec técnica + tickets atômicos (máx. 15).', color: '#f7c36a' },
    ],
  },
  en: {
    navFluxo: 'Flow',
    navAgentes: 'Agents',
    navTelemetria: 'Telemetry',
    navCta: 'Open app →',
    heroBadge: '🏆 Google ADK Hackathon · Taskmaster Category',
    heroTitle1: 'From idea to code',
    heroTitle2: 'in minutes, not weeks',
    heroSub: '3 Google ADK agents collaborating to transform any idea into technical spec, ADRs, PRD and development tickets — via interactive Grill-Me elicitation with Gemini.',
    ctaPrimary: 'Create my first project →',
    ctaSecondary: 'See how it works',
    statElicitando: 'In elicitation',
    statProgresso: 'In progress',
    statConcluido: 'Completed',
    videoTag: 'Pipeline Visualization',
    videoTitle: 'From input to artifact — in real time',
    videoSub: 'Each node represents a real system component. Arrows show the data flow between ADK agents, RabbitMQ and Firestore.',
    flowTag: 'Detailed Flow',
    flowTitle: '7 steps, 3 agents, 1 ZIP',
    agentsTag: 'Multi-Agent ADK 2.8',
    agentsTitle: '3 specialists, 1 pipeline',
    agentsSub: 'Each agent has an isolated responsibility and a defined output key in ADK. The SequentialAgent orchestrates the collaboration.',
    telTag: 'Live Telemetry · Firestore',
    telTitle: 'System state right now',
    telSub: 'Real Firestore data via onSnapshot — updates without reloading.',
    telElicitando: 'In Elicitation',
    telProgresso: 'In Progress',
    telConcluido: 'Completed',
    telDescElicitando: 'waiting for user responses',
    telDescProgresso: 'awaiting approval or generating docs',
    telDescConcluido: 'artifacts available for download',
    ctaFinalTitle: 'Ready to accelerate your next project?',
    ctaFinalSub: '3 ADK agents + Gemini transform your idea into complete technical documentation.',
    ctaFinalBtn: 'Create my project now →',
    footerHackathon: 'Google ADK Hackathon 2025',
    footerCategory: 'Taskmaster Category',
    footerPipeline: 'Pipeline',
    steps: [
      { num: '01', icon: '💡', title: 'You describe the idea',            desc: 'Project name and description. No bureaucracy — no complex forms.', color: '#f7c36a' },
      { num: '02', icon: '🔌', title: 'API receives and queues',          desc: 'POST /projects → Firestore TRIAGEM_INICIAL → RabbitMQ pyahu.pipeline. Immediate response.', color: '#7c6af7', badge: 'Async' },
      { num: '03', icon: '🤖', title: 'OrchestratorAgent elicits',        desc: 'Up to 4 rounds of structured Q1..Q5 questions with ➡️ recommendations — interactive Gemini interview.', color: '#7c6af7', badge: 'ADK' },
      { num: '04', icon: '👤', title: 'You review the scope',             desc: 'Gemini generates a markdown project summary. You approve or request revision with feedback.', color: '#f87171', badge: 'HITL' },
      { num: '05', icon: '📋', title: 'ArtifactsAgent generates ADRs + PRD', desc: 'Architecture Decision Records and Product Requirements Doc based on the full elicitation history.', color: '#22d3a0', badge: 'ADK' },
      { num: '06', icon: '📝', title: 'SpecAgent generates Spec + Tickets', desc: 'Detailed technical specification and atomic tickets: infra → domain → API → frontend.', color: '#7c6af7', badge: 'ADK' },
      { num: '07', icon: '📦', title: 'Download ZIP',                     desc: 'spec.md + prd.md + ADRs + tickets — canonical structure ready for your repository.', color: '#22d3a0' },
    ],
    agents: [
      { icon: '🤖', name: 'OrchestratorAgent', role: 'LlmAgent · Elicitation', desc: 'Conducts Q1..Q5 question rounds with ➡️ recommendations. Up to 4 rounds, signals ready: true when enough context is gathered.', color: '#7c6af7' },
      { icon: '📋', name: 'ArtifactsAgent',    role: 'LlmAgent · ADRs + PRD',  desc: 'Receives the full elicitation history and generates Architecture Decision Records and Product Requirements Document.', color: '#22d3a0' },
      { icon: '📝', name: 'SpecAgent',          role: 'LlmAgent · Spec + Tickets', desc: 'Consumes ArtifactsAgent output and generates detailed technical spec + atomic development tickets (max 15).', color: '#f7c36a' },
    ],
  },
  es: {
    navFluxo: 'Flujo',
    navAgentes: 'Agentes',
    navTelemetria: 'Telemetría',
    navCta: 'Abrir app →',
    heroBadge: '🏆 Google ADK Hackathon · Categoría Taskmaster',
    heroTitle1: 'De la idea al código',
    heroTitle2: 'en minutos, no semanas',
    heroSub: '3 agentes Google ADK colaborando para transformar cualquier idea en spec técnica, ADRs, PRD y tickets de desarrollo — mediante elicitación interactiva con Gemini.',
    ctaPrimary: 'Crear mi primer proyecto →',
    ctaSecondary: 'Ver cómo funciona',
    statElicitando: 'En elicitación',
    statProgresso: 'En progreso',
    statConcluido: 'Completados',
    videoTag: 'Visualización del Pipeline',
    videoTitle: 'Del input al artefacto — en tiempo real',
    videoSub: 'Cada nodo representa un componente real del sistema. Las flechas muestran el flujo de datos entre los agentes ADK, RabbitMQ y Firestore.',
    flowTag: 'Flujo Detallado',
    flowTitle: '7 pasos, 3 agentes, 1 ZIP',
    agentsTag: 'Multi-Agentes ADK 2.8',
    agentsTitle: '3 especialistas, 1 pipeline',
    agentsSub: 'Cada agente tiene una responsabilidad aislada y una output key definida en ADK. El SequentialAgent orquesta la colaboración.',
    telTag: 'Telemetría en vivo · Firestore',
    telTitle: 'Estado del sistema ahora',
    telSub: 'Datos reales de Firestore via onSnapshot — se actualizan sin recargar.',
    telElicitando: 'En Elicitación',
    telProgresso: 'En Progreso',
    telConcluido: 'Completados',
    telDescElicitando: 'esperando respuestas del usuario',
    telDescProgresso: 'esperando aprobación o generando docs',
    telDescConcluido: 'artefactos disponibles para descarga',
    ctaFinalTitle: '¿Listo para acelerar tu próximo proyecto?',
    ctaFinalSub: '3 agentes ADK + Gemini transforman tu idea en documentación técnica completa.',
    ctaFinalBtn: 'Crear mi proyecto ahora →',
    footerHackathon: 'Google ADK Hackathon 2025',
    footerCategory: 'Categoría Taskmaster',
    footerPipeline: 'Pipeline',
    steps: [
      { num: '01', icon: '💡', title: 'Describes la idea',                desc: 'Nombre y descripción del proyecto. Sin burocracia — sin formularios complejos.', color: '#f7c36a' },
      { num: '02', icon: '🔌', title: 'La API recibe y publica en cola',  desc: 'POST /projects → Firestore TRIAGEM_INICIAL → RabbitMQ pyahu.pipeline. Respuesta inmediata.', color: '#7c6af7', badge: 'Asíncrono' },
      { num: '03', icon: '🤖', title: 'OrchestratorAgent elicita',        desc: 'Hasta 4 rondas de preguntas Q1..Q5 con ➡️ recomendaciones — entrevista interactiva con Gemini.', color: '#7c6af7', badge: 'ADK' },
      { num: '04', icon: '👤', title: 'Revisas el alcance',               desc: 'Gemini genera un resumen markdown del proyecto. Apruebas o solicitas revisión con feedback.', color: '#f87171', badge: 'HITL' },
      { num: '05', icon: '📋', title: 'ArtifactsAgent genera ADRs + PRD', desc: 'Architecture Decision Records y Product Requirements Doc basados en el historial completo.', color: '#22d3a0', badge: 'ADK' },
      { num: '06', icon: '📝', title: 'SpecAgent genera Spec + Tickets',  desc: 'Especificación técnica detallada y tickets atómicos: infra → dominio → API → frontend.', color: '#7c6af7', badge: 'ADK' },
      { num: '07', icon: '📦', title: 'Descarga el ZIP',                  desc: 'spec.md + prd.md + ADRs + tickets — estructura canónica lista para tu repositorio.', color: '#22d3a0' },
    ],
    agents: [
      { icon: '🤖', name: 'OrchestratorAgent', role: 'LlmAgent · Elicitación',   desc: 'Conduce rondas de preguntas Q1..Q5 con ➡️ recomendaciones. Máximo 4 rondas, señala listo: true cuando tiene contexto suficiente.', color: '#7c6af7' },
      { icon: '📋', name: 'ArtifactsAgent',    role: 'LlmAgent · ADRs + PRD',    desc: 'Recibe el historial completo y genera Architecture Decision Records y Product Requirements Document.', color: '#22d3a0' },
      { icon: '📝', name: 'SpecAgent',          role: 'LlmAgent · Spec + Tickets', desc: 'Consume la salida del ArtifactsAgent y genera spec técnica + tickets atómicos (máx. 15).', color: '#f7c36a' },
    ],
  },
} as const;

const LANG_FLAGS: Record<Lang, string> = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };
const LANG_LABELS: Record<Lang, string> = { pt: 'PT', en: 'EN', es: 'ES' };

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

// ── Página principal ────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const telemetry = useLiveTelemetry();
  const playerRef = useRef(null);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('pyahu_lang') as Lang | null;
    if (saved && ['pt', 'en', 'es'].includes(saved)) return saved;
    const browser = navigator.language.slice(0, 2).toLowerCase();
    if (browser === 'es') return 'es';
    if (browser === 'en') return 'en';
    return 'pt';
  });

  const t = I18N[lang];

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('pyahu_lang', l);
  };

  return (
    <div className={styles.page}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>⚡</span>
          <span>Pyahu Scrum</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#fluxo">{t.navFluxo}</a>
          <a href="#agentes">{t.navAgentes}</a>
          <a href="#telemetria">{t.navTelemetria}</a>
        </div>
        <div className={styles.navRight}>
          {/* Seletor de idioma */}
          <div className={styles.langSwitcher}>
            {(['pt', 'en', 'es'] as Lang[]).map((l) => (
              <button
                key={l}
                className={`${styles.langBtn} ${lang === l ? styles.langBtnActive : ''}`}
                onClick={() => switchLang(l)}
                title={l === 'pt' ? 'Português' : l === 'en' ? 'English' : 'Español'}
              >
                {LANG_FLAGS[l]} {LANG_LABELS[l]}
              </button>
            ))}
          </div>
          <a href="/login" className={styles.navCta}>{t.navCta}</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>{t.heroBadge}</div>
        <h1 className={styles.heroTitle}>
          {t.heroTitle1}<br />
          <span className={styles.heroAccent}>{t.heroTitle2}</span>
        </h1>
        <p className={styles.heroSub}>{t.heroSub}</p>
        <div className={styles.heroCtas}>
          <a href="/login" className={styles.ctaPrimary}>{t.ctaPrimary}</a>
          <a href="#fluxo" className={styles.ctaSecondary}>{t.ctaSecondary}</a>
        </div>

        {/* Telemetria live */}
        <div className={styles.heroStats}>
          {[
            { label: t.statElicitando, value: telemetry.elicitando, color: '#7c6af7', dot: true },
            { label: t.statProgresso,  value: telemetry.progresso,  color: '#f7c36a', dot: true },
            { label: t.statConcluido,  value: telemetry.concluido,  color: '#22d3a0', dot: false },
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

      {/* ── Vídeo Remotion ── */}
      <section id="fluxo" className={styles.videoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>{t.videoTag}</span>
          <h2 className={styles.sectionTitle}>{t.videoTitle}</h2>
          <p className={styles.sectionSub}>{t.videoSub}</p>
        </div>
        <div className={styles.playerWrapper}>
          <Player
            ref={playerRef}
            component={PipelineAnimation}
            durationInFrames={130}
            compositionWidth={1280}
            compositionHeight={520}
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
          <span className={styles.sectionTag}>{t.flowTag}</span>
          <h2 className={styles.sectionTitle}>{t.flowTitle}</h2>
        </div>
        <div className={styles.flowGrid}>
          {t.steps.map((step) => (
            <div key={step.num} className={styles.flowStep}>
              <div className={styles.flowNum} style={{ color: step.color, borderColor: `${step.color}40` }}>
                {step.num}
              </div>
              <div className={styles.flowContent}>
                <div className={styles.flowHeader}>
                  <span className={styles.flowIcon}>{step.icon}</span>
                  <h3 className={styles.flowTitle}>{step.title}</h3>
                  {'badge' in step && step.badge && (
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
          <span className={styles.sectionTag}>{t.agentsTag}</span>
          <h2 className={styles.sectionTitle}>{t.agentsTitle}</h2>
          <p className={styles.sectionSub}>{t.agentsSub}</p>
        </div>
        <div className={styles.agentsGrid}>
          {t.agents.map((a) => (
            <div key={a.name} className={styles.agentCard} style={{ borderColor: `${a.color}30` }}>
              <div className={styles.agentTop}>
                <div className={styles.agentIcon} style={{ background: `${a.color}1a`, border: `1px solid ${a.color}50` }}>
                  {a.icon}
                </div>
                <div>
                  <p className={styles.agentName}>{a.name}</p>
                  <p className={styles.agentRole} style={{ color: a.color }}>{a.role}</p>
                </div>
              </div>
              <p className={styles.agentDesc}>{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Diagrama de colaboração */}
        <div className={styles.collabDiagram}>
          <div className={styles.collabNode} style={{ borderColor: '#7c6af740' }}>
            <span>🤖</span><span>OrchestratorAgent</span>
          </div>
          <div className={styles.collabArrow}>→</div>
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
          <span className={styles.sectionTag}>{t.telTag}</span>
          <h2 className={styles.sectionTitle}>{t.telTitle}</h2>
          <p className={styles.sectionSub}>
            {t.telSub}
          </p>
        </div>
        <div className={styles.telemetryGrid}>
          {[
            { label: t.telElicitando, value: telemetry.elicitando, icon: '💬', color: '#7c6af7', desc: t.telDescElicitando },
            { label: t.telProgresso,  value: telemetry.progresso,  icon: '⚙️', color: '#f7c36a', desc: t.telDescProgresso },
            { label: t.telConcluido,  value: telemetry.concluido,  icon: '✅', color: '#22d3a0', desc: t.telDescConcluido },
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
        <h2 className={styles.ctaTitle}>{t.ctaFinalTitle}</h2>
        <p className={styles.ctaSub}>{t.ctaFinalSub}</p>
        <a href="/login" className={styles.ctaPrimary} style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
          {t.ctaFinalBtn}
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <span>⚡ Pyahu Scrum</span>
          <span className={styles.footerSep}>·</span>
          <span>{t.footerHackathon}</span>
          <span className={styles.footerSep}>·</span>
          <span>{t.footerCategory}</span>
        </div>
        <div className={styles.footerRight}>
          <a href="https://github.com/edcastanha/PyahuScrum" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="/pipeline/elicitacao">{t.footerPipeline}</a>
          <a href="https://api-homolog.pyahuscrum.adbfn6.easypanel.host/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
