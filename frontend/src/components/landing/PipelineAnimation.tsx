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
  bg: '#0d0d1a',
  surface: '#13132a',
  card: '#1a1a35',
  border: '#2a2a50',
  accent: '#7c6af7',
  accentGlow: 'rgba(124,106,247,0.3)',
  green: '#22d3a0',
  yellow: '#f7c36a',
  text: '#e0e0f0',
  muted: '#8888aa',
};

// ── Nó do pipeline ──────────────────────────────────────────────────────────
function PipelineNode({
  label,
  icon,
  color,
  frame,
  startFrame,
  x,
  y,
}: {
  label: string;
  icon: string;
  color: string;
  frame: number;
  startFrame: number;
  x: number;
  y: number;
}) {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const scale = interpolate(progress, [0, 1], [0.4, 1]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1]);

  return (
    <g transform={`translate(${x}, ${y})`} style={{ opacity }}>
      {/* Glow */}
      <circle r={38} fill={color} opacity={0.12 * progress} />
      {/* Círculo */}
      <circle
        r={32}
        fill={C.card}
        stroke={color}
        strokeWidth={2}
        transform={`scale(${scale})`}
      />
      {/* Ícone */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        transform={`scale(${scale})`}
      >
        {icon}
      </text>
      {/* Label */}
      <text
        y={48}
        textAnchor="middle"
        fill={C.text}
        fontSize={11}
        fontFamily="Inter, sans-serif"
        fontWeight={600}
        opacity={progress}
      >
        {label}
      </text>
    </g>
  );
}

// ── Seta animada ────────────────────────────────────────────────────────────
function Arrow({
  x1, y1, x2, y2,
  frame, startFrame, color,
}: {
  x1: number; y1: number; x2: number; y2: number;
  frame: number; startFrame: number; color: string;
}) {
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 18 } });
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const drawLen = interpolate(progress, [0, 1], [0, len]);

  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={len}
      strokeDashoffset={len - drawLen}
      markerEnd="url(#arrow)"
      opacity={0.8}
    />
  );
}

// ── Card de status ──────────────────────────────────────────────────────────
function StatusCard({
  label, value, sub, frame, startFrame, x, y, color,
}: {
  label: string; value: string; sub: string;
  frame: number; startFrame: number;
  x: number; y: number; color: string;
}) {
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 15 } });
  const translateY = interpolate(progress, [0, 1], [30, 0]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1]);

  return (
    <g transform={`translate(${x}, ${y + translateY})`} style={{ opacity }}>
      <rect width={160} height={80} rx={12} fill={C.card} stroke={C.border} strokeWidth={1} />
      <rect width={4} height={40} x={0} y={20} rx={2} fill={color} />
      <text x={18} y={28} fill={C.muted} fontSize={9} fontFamily="Inter, sans-serif" fontWeight={500}>
        {label.toUpperCase()}
      </text>
      <text x={18} y={52} fill={color} fontSize={22} fontFamily="Inter, sans-serif" fontWeight={700}>
        {value}
      </text>
      <text x={18} y={68} fill={C.muted} fontSize={9} fontFamily="Inter, sans-serif">
        {sub}
      </text>
    </g>
  );
}

// ── Label flutuante ────────────────────────────────────────────────────────
function FloatingLabel({
  text, x, y, frame, startFrame, color = C.accent,
}: {
  text: string; x: number; y: number;
  frame: number; startFrame: number; color?: string;
}) {
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 20 } });
  const opacity = interpolate(progress, [0, 0.5], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ opacity }}>
      <rect
        x={-60} y={-14} width={120} height={24} rx={6}
        fill={color} opacity={0.15}
      />
      <rect
        x={-60} y={-14} width={120} height={24} rx={6}
        fill="none" stroke={color} strokeWidth={1} opacity={0.4}
      />
      <text
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={10}
        fontFamily="Inter, monospace" fontWeight={600}
      >
        {text}
      </text>
    </g>
  );
}

// ── Composição principal ────────────────────────────────────────────────────
export const PipelineAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Posições dos nós — linha central com ramificação
  const nodes = [
    { id: 'input',    label: 'Ideia',           icon: '💡', color: C.yellow,  x: cx - 480, y: cy - 60, start: 0  },
    { id: 'api',      label: 'POST /projects',   icon: '🔌', color: C.accent,  x: cx - 280, y: cy - 60, start: 12 },
    { id: 'queue',    label: 'RabbitMQ',         icon: '🐇', color: C.green,   x: cx - 60,  y: cy - 60, start: 24 },
    { id: 'orch',     label: 'OrchestratorAgent',icon: '🤖', color: C.accent,  x: cx + 160, y: cy - 60, start: 36 },
    { id: 'grill',    label: 'Grill Rounds',     icon: '❓', color: C.yellow,  x: cx + 160, y: cy + 80, start: 48 },
    { id: 'hitl',     label: 'HITL Aprovação',   icon: '👤', color: '#f87171', x: cx + 380, y: cy - 60, start: 60 },
    { id: 'artifacts',label: 'ArtifactsAgent',   icon: '📋', color: C.green,   x: cx + 380, y: cy + 80, start: 72 },
    { id: 'spec',     label: 'SpecAgent',        icon: '📝', color: C.accent,  x: cx + 600, y: cy + 80, start: 84 },
    { id: 'zip',      label: 'Download ZIP',     icon: '📦', color: C.green,   x: cx + 600, y: cy - 60, start: 96 },
  ];

  const arrows = [
    { x1: cx-448, y1: cy-60, x2: cx-312, y2: cy-60, start: 18,  color: C.accent  },
    { x1: cx-248, y1: cy-60, x2: cx-92,  y2: cy-60, start: 30,  color: C.green   },
    { x1: cx-28,  y1: cy-60, x2: cx+128, y2: cy-60, start: 42,  color: C.accent  },
    { x1: cx+160, y1: cy-28, x2: cx+160, y2: cy+48, start: 54,  color: C.yellow  },
    { x1: cx+192, y1: cy-60, x2: cx+348, y2: cy-60, start: 66,  color: '#f87171' },
    { x1: cx+380, y1: cy-28, x2: cx+380, y2: cy+48, start: 78,  color: C.green   },
    { x1: cx+412, y1: cy+80, x2: cx+568, y2: cy+80, start: 90,  color: C.accent  },
    { x1: cx+600, y1: cy+48, x2: cx+600, y2: cy-28, start: 100, color: C.green   },
  ];

  const statusCards = [
    { label: 'Projetos',    value: '3',   sub: 'em elicitação',  x: 40,  y: 40,  color: C.accent, start: 108 },
    { label: 'Concluídos',  value: '12',  sub: 'artefatos ZIP',  x: 220, y: 40,  color: C.green,  start: 114 },
    { label: 'Agentes ADK', value: '3',   sub: 'colaborando',    x: 400, y: 40,  color: C.yellow, start: 120 },
    { label: 'Rounds',      value: '4',   sub: 'máx elicitação', x: 580, y: 40,  color: '#f87171',start: 126 },
  ];

  // Título
  const titleProgress = spring({ frame, fps: 30, config: { damping: 15 } });
  const titleOpacity = interpolate(titleProgress, [0, 0.5], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [cy - 190, cy - 200]);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Grade de pontos */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={C.border} />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#dots)" />
      </svg>

      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={C.accent} opacity={0.7} />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Título */}
        <text
          x={cx} y={titleY}
          textAnchor="middle"
          fill={C.text}
          fontSize={28}
          fontFamily="Inter, sans-serif"
          fontWeight={800}
          style={{ opacity: titleOpacity }}
        >
          Pipeline Pyahu Scrum — Fluxo de Agentes ADK
        </text>
        <text
          x={cx} y={titleY + 30}
          textAnchor="middle"
          fill={C.muted}
          fontSize={13}
          fontFamily="Inter, sans-serif"
          style={{ opacity: titleOpacity }}
        >
          Da ideia bruta ao ZIP com spec, prd, ADRs e tickets — 3 agentes colaborando
        </text>

        {/* Setas */}
        {arrows.map((a, i) => (
          <Arrow key={i} {...a} frame={frame} startFrame={a.start} />
        ))}

        {/* Nós */}
        {nodes.map((n) => (
          <PipelineNode key={n.id} {...n} frame={frame} startFrame={n.start} />
        ))}

        {/* Status cards */}
        {statusCards.map((c, i) => (
          <StatusCard key={i} {...c} frame={frame} startFrame={c.start} />
        ))}

        {/* Labels flutuantes */}
        <Sequence from={50}>
          <FloatingLabel text="Q1 ➡ Recomendo (A)" x={cx + 160} y={cy + 140} frame={frame} startFrame={50} color={C.yellow} />
        </Sequence>
        <Sequence from={62}>
          <FloatingLabel text="Aguardando aprovação..." x={cx + 380} y={cy - 100} frame={frame} startFrame={62} color="#f87171" />
        </Sequence>
        <Sequence from={98}>
          <FloatingLabel text="✅ spec.md + prd.md + ADRs + tickets" x={cx + 600} y={cy - 100} frame={frame} startFrame={98} color={C.green} />
        </Sequence>

        {/* Painel de legenda */}
        <Sequence from={110}>
          {frame >= 110 && (
            <g opacity={interpolate(frame, [110, 125], [0, 1])}>
              <rect x={width - 220} y={height - 130} width={200} height={110} rx={10}
                fill={C.card} stroke={C.border} strokeWidth={1} />
              {[
                { color: C.accent, label: 'OrchestratorAgent' },
                { color: C.green,  label: 'ArtifactsAgent' },
                { color: C.yellow, label: 'SpecAgent (ADK)' },
                { color: '#f87171',label: 'HITL (usuário)' },
              ].map((item, i) => (
                <g key={i} transform={`translate(${width - 210}, ${height - 115 + i * 22})`}>
                  <circle r={5} cx={8} cy={8} fill={item.color} />
                  <text x={20} y={12} fill={C.muted} fontSize={10} fontFamily="Inter, sans-serif">
                    {item.label}
                  </text>
                </g>
              ))}
            </g>
          )}
        </Sequence>
      </svg>
    </AbsoluteFill>
  );
};
