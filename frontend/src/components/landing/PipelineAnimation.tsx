import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

// ── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0d0d1a',
  card:    '#1a1a35',
  border:  '#2a2a50',
  accent:  '#7c6af7',
  green:   '#22d3a0',
  yellow:  '#f7c36a',
  red:     '#f87171',
  text:    '#e0e0f0',
  muted:   '#8888aa',
};

// Layout: 3 zonas verticais
// Zona 1 — Título:      y 0..70
// Zona 2 — Diagrama:    y 70..370
// Zona 3 — Status cards: y 370..480

const TITLE_Y  = 38;
const DIAG_TOP = 80;   // topo da zona do diagrama
const CARD_Y   = 385;  // topo dos status cards

// ── Nó animado ──────────────────────────────────────────────────────────────
function PipelineNode({
  label, icon, color, frame, startFrame, x, y,
}: {
  label: string; icon: string; color: string;
  frame: number; startFrame: number; x: number; y: number;
}) {
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 120 } });
  const scale   = interpolate(p, [0, 1], [0.3, 1]);
  const opacity = interpolate(p, [0, 0.3], [0, 1]);

  return (
    <g transform={`translate(${x},${y})`} style={{ opacity }}>
      {/* Halo */}
      <circle r={42} fill={color} opacity={0.1 * p} />
      {/* Círculo principal */}
      <circle r={30} fill={C.card} stroke={color} strokeWidth={2} transform={`scale(${scale})`} />
      {/* Ícone */}
      <text textAnchor="middle" dominantBaseline="central" fontSize={18} transform={`scale(${scale})`}>
        {icon}
      </text>
      {/* Label */}
      <text y={46} textAnchor="middle" fill={C.text} fontSize={10}
        fontFamily="Inter, sans-serif" fontWeight={600} opacity={p}>
        {label}
      </text>
    </g>
  );
}

// ── Seta progressiva ────────────────────────────────────────────────────────
function Arrow({
  x1, y1, x2, y2, frame, startFrame, color, curved = false,
}: {
  x1: number; y1: number; x2: number; y2: number;
  frame: number; startFrame: number; color: string; curved?: boolean;
}) {
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startFrame, fps, config: { damping: 18 } });

  if (curved) {
    // seta curva para ramificações verticais
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const totalLen = Math.abs(y2 - y1) * 1.2;
    const drawLen = interpolate(p, [0, 1], [0, totalLen]);
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={2} opacity={0.75}
        strokeDasharray={totalLen}
        strokeDashoffset={totalLen - drawLen}
        markerEnd="url(#arrowHead)"
      />
    );
  }

  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const drawLen = interpolate(p, [0, 1], [0, len]);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={2} opacity={0.75}
      strokeDasharray={len}
      strokeDashoffset={len - drawLen}
      markerEnd="url(#arrowHead)"
    />
  );
}

// ── Status card (zona inferior) ──────────────────────────────────────────────
function StatusCard({
  label, value, sub, frame, startFrame, x, color,
}: {
  label: string; value: string; sub: string;
  frame: number; startFrame: number; x: number; color: string;
}) {
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startFrame, fps, config: { damping: 15 } });
  const ty  = interpolate(p, [0, 1], [20, 0]);
  const op  = interpolate(p, [0, 0.4], [0, 1]);
  const W = 190; const H = 76;

  return (
    <g transform={`translate(${x}, ${CARD_Y + ty})`} style={{ opacity: op }}>
      <rect width={W} height={H} rx={10} fill={C.card} stroke={C.border} strokeWidth={1} />
      <rect width={3} height={36} x={0} y={20} rx={2} fill={color} />
      <text x={14} y={24} fill={C.muted} fontSize={8}
        fontFamily="Inter, sans-serif" fontWeight={700} letterSpacing={1}>
        {label.toUpperCase()}
      </text>
      <text x={14} y={50} fill={color} fontSize={24}
        fontFamily="Inter, sans-serif" fontWeight={800}>
        {value}
      </text>
      <text x={14} y={66} fill={C.muted} fontSize={8} fontFamily="Inter, sans-serif">
        {sub}
      </text>
    </g>
  );
}

// ── Label flutuante ──────────────────────────────────────────────────────────
function FloatingLabel({
  text, x, y, frame, startFrame, color = C.accent,
}: {
  text: string; x: number; y: number;
  frame: number; startFrame: number; color?: string;
}) {
  const { fps } = useVideoConfig();
  const p  = spring({ frame: frame - startFrame, fps, config: { damping: 20 } });
  const op = interpolate(p, [0, 0.5], [0, 1]);
  const sc = interpolate(p, [0, 1], [0.85, 1]);

  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} style={{ opacity: op }}>
      <rect x={-66} y={-13} width={132} height={24} rx={6}
        fill={color} opacity={0.13} />
      <rect x={-66} y={-13} width={132} height={24} rx={6}
        fill="none" stroke={color} strokeWidth={1} opacity={0.35} />
      <text textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={9.5}
        fontFamily="'Courier New', monospace" fontWeight={600}>
        {text}
      </text>
    </g>
  );
}

// ── Composição principal ─────────────────────────────────────────────────────
export const PipelineAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ── Posições horizontais dos nós (linha principal y=DIAG_TOP+120) ──────────
  const ROW1 = DIAG_TOP + 120;  // linha principal
  const ROW2 = DIAG_TOP + 245;  // linha inferior (Grill Rounds, ArtifactsAgent, SpecAgent)

  // Distribui 6 nós na linha principal com margem
  const xs = [90, 230, 370, 510, 700, 890, 1080, 1190];
  //           ideia  api  queue orch  hitl  zip
  // Ramificações para baixo: orch→grill, hitl→artifacts→spec

  const nodes1 = [
    { id:'input',  label:'Ideia',             icon:'💡', color:C.yellow,  x:xs[0], y:ROW1, start:0  },
    { id:'api',    label:'POST /projects',    icon:'🔌', color:C.accent,  x:xs[1], y:ROW1, start:10 },
    { id:'queue',  label:'RabbitMQ',          icon:'🐇', color:C.green,   x:xs[2], y:ROW1, start:20 },
    { id:'orch',   label:'OrchestratorAgent', icon:'🤖', color:C.accent,  x:xs[3], y:ROW1, start:30 },
    { id:'hitl',   label:'HITL Aprovação',    icon:'👤', color:C.red,     x:xs[4], y:ROW1, start:52 },
    { id:'zip',    label:'Download ZIP',      icon:'📦', color:C.green,   x:xs[5], y:ROW1, start:82 },
  ];

  const nodes2 = [
    { id:'grill',     label:'Grill Rounds',   icon:'❓', color:C.yellow,  x:xs[3], y:ROW2, start:40 },
    { id:'artifacts', label:'ArtifactsAgent', icon:'📋', color:C.green,   x:xs[4], y:ROW2, start:62 },
    { id:'spec',      label:'SpecAgent',      icon:'📝', color:C.accent,  x:xs[5], y:ROW2, start:72 },
  ];

  const arrows = [
    // Linha principal
    { x1:xs[0]+32, y1:ROW1,    x2:xs[1]-32, y2:ROW1,    start:14, color:C.accent },
    { x1:xs[1]+32, y1:ROW1,    x2:xs[2]-32, y2:ROW1,    start:24, color:C.green  },
    { x1:xs[2]+32, y1:ROW1,    x2:xs[3]-32, y2:ROW1,    start:34, color:C.accent },
    { x1:xs[3]+32, y1:ROW1,    x2:xs[4]-32, y2:ROW1,    start:56, color:C.red    },
    { x1:xs[4]+32, y1:ROW1,    x2:xs[5]-32, y2:ROW1,    start:86, color:C.green  },
    // Ramificações verticais
    { x1:xs[3],    y1:ROW1+32, x2:xs[3],    y2:ROW2-32, start:44, color:C.yellow },
    { x1:xs[4],    y1:ROW1+32, x2:xs[4],    y2:ROW2-32, start:66, color:C.green  },
    // SpecAgent → ZIP (sobe)
    { x1:xs[5]+32, y1:ROW2,    x2:xs[5]+32, y2:ROW1+32, start:76, color:C.accent },
    // ArtifactsAgent → SpecAgent
    { x1:xs[4]+32, y1:ROW2,    x2:xs[5]-32, y2:ROW2,    start:74, color:C.accent },
  ];

  // Título
  const titleP = spring({ frame, fps, config: { damping: 16 } });
  const titleOp = interpolate(titleP, [0, 0.5], [0, 1]);

  // Status cards (zona inferior)
  const statusCards = [
    { label:'Projetos',    value:'3',  sub:'em elicitação',  color:C.accent, x:40,   start:95  },
    { label:'Concluídos',  value:'12', sub:'artefatos ZIP',  color:C.green,  x:250,  start:100 },
    { label:'Agentes ADK', value:'3',  sub:'colaborando',    color:C.yellow, x:460,  start:105 },
    { label:'Rodadas',     value:'4',  sub:'máx elicitação', color:C.red,    x:670,  start:110 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Grade de pontos de fundo */}
      <svg width={width} height={height}
        style={{ position:'absolute', top:0, left:0, opacity:0.12 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={C.border} />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#dots)" />
      </svg>

      {/* Separadores de zona */}
      <svg width={width} height={height} style={{ position:'absolute', top:0, left:0 }}>
        {/* Linha separando diagrama dos status cards */}
        <line x1={0} y1={CARD_Y - 10} x2={width} y2={CARD_Y - 10}
          stroke={C.border} strokeWidth={1} opacity={0.4} />
      </svg>

      <svg width={width} height={height} style={{ position:'absolute', top:0, left:0 }}>
        <defs>
          <marker id="arrowHead" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={C.accent} opacity={0.7} />
          </marker>
        </defs>

        {/* ── ZONA 1: Título ── */}
        <text
          x={width / 2} y={TITLE_Y}
          textAnchor="middle"
          fill={C.text}
          fontSize={22}
          fontFamily="Inter, sans-serif"
          fontWeight={800}
          style={{ opacity: titleOp }}
        >
          Pipeline Pyahu Scrum — Fluxo de Agentes ADK
        </text>
        <text
          x={width / 2} y={TITLE_Y + 24}
          textAnchor="middle"
          fill={C.muted}
          fontSize={11}
          fontFamily="Inter, sans-serif"
          style={{ opacity: titleOp }}
        >
          Da ideia bruta ao ZIP com spec, prd, ADRs e tickets — 3 agentes ADK colaborando
        </text>

        {/* ── ZONA 2: Diagrama ── */}
        {/* Setas */}
        {arrows.map((a, i) => (
          <Arrow key={i} {...a} frame={frame} startFrame={a.start} />
        ))}

        {/* Nós linha principal */}
        {nodes1.map(n => (
          <PipelineNode key={n.id} {...n} frame={frame} startFrame={n.start} />
        ))}

        {/* Nós linha inferior */}
        {nodes2.map(n => (
          <PipelineNode key={n.id} {...n} frame={frame} startFrame={n.start} />
        ))}

        {/* Labels flutuantes */}
        <Sequence from={42}>
          <FloatingLabel
            text="Q1 ➡ Recomendo (A)" x={xs[3]} y={ROW2 + 70}
            frame={frame} startFrame={42} color={C.yellow} />
        </Sequence>
        <Sequence from={54}>
          <FloatingLabel
            text="Aguardando aprovação…" x={xs[4]} y={ROW1 - 60}
            frame={frame} startFrame={54} color={C.red} />
        </Sequence>
        <Sequence from={80}>
          <FloatingLabel
            text="spec.md · prd.md · ADRs · tickets" x={xs[5]} y={ROW1 - 60}
            frame={frame} startFrame={80} color={C.green} />
        </Sequence>

        {/* Legenda */}
        <Sequence from={92}>
          {frame >= 92 && (() => {
            const op = interpolate(frame, [92, 106], [0, 1]);
            const items = [
              { color: C.accent, label: 'OrchestratorAgent' },
              { color: C.green,  label: 'ArtifactsAgent' },
              { color: C.yellow, label: 'SpecAgent (ADK)' },
              { color: C.red,    label: 'HITL (usuário)' },
            ];
            return (
              <g opacity={op}>
                <rect x={width - 200} y={DIAG_TOP + 8} width={186} height={96}
                  rx={8} fill={C.card} stroke={C.border} strokeWidth={1} />
                {items.map((item, i) => (
                  <g key={i} transform={`translate(${width - 192}, ${DIAG_TOP + 22 + i * 20})`}>
                    <circle r={4} cx={6} cy={6} fill={item.color} />
                    <text x={16} y={10} fill={C.muted} fontSize={9}
                      fontFamily="Inter, sans-serif">
                      {item.label}
                    </text>
                  </g>
                ))}
              </g>
            );
          })()}
        </Sequence>

        {/* ── ZONA 3: Status Cards ── */}
        {statusCards.map((c, i) => (
          <StatusCard key={i} {...c} frame={frame} startFrame={c.start} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
