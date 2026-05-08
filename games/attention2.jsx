{
const { GameShell, choice, rand, useEffect, useRef, useState } = window.GameKit;

/* ── Shared Level Picker ────────────────────────────────────────────── */
function LevelPicker({ title, levels, onPick }) {
  return (
    <div style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Choose Your Level</h3>
      <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 14, margin: "0 0 24px" }}>
        Pick how challenging you want <em>{title}</em> to be
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {levels.map(lvl => (
          <button
            key={lvl.id}
            onClick={() => onPick(lvl.id)}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "18px 20px",
              background: lvl.bg,
              border: `2px solid ${lvl.borderColor}`,
              borderRadius: 16, cursor: "pointer", textAlign: "left",
              transition: "transform 0.12s, box-shadow 0.12s",
              width: "100%", color: "inherit"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>{lvl.icon}</span>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 18, color: lvl.color, display: "block", marginBottom: 2 }}>{lvl.label}</strong>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>{lvl.desc}</span>
            </div>
            <span style={{ fontSize: 22, color: lvl.color, opacity: 0.6 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Attentional Blink ──────────────────────────────────────────────── */
function AttentionalBlink() {
  const [phase, setPhase]     = useState("intro");
  const [picked, setPicked]   = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [current, setCurrent] = useState("");
  const [showQ, setShowQ]     = useState(false);
  const [rows, setRows]       = useState([]);
  const trialRef = useRef({ lag: 0, n: 0 });
  const timerRef = useRef(null);
  const LETTERS = "ABCDEFGHJKLMNOPQRSTUVWYZ".split("");

  const CONFIGS = {
    easy:   { interval: 200, total: 8,  lagMax: 4 },
    medium: { interval: 140, total: 12, lagMax: 6 },
    hard:   { interval: 100, total: 16, lagMax: 6 },
  };
  const cfg = CONFIGS[difficulty];

  const LEVELS = [
    { id: "easy",   icon: "🟢", label: "Easy",   color: "#059669", bg: "#ECFDF5", borderColor: "#A7F3D0", desc: "Slow flashes (200 ms) · 8 rounds · relaxed" },
    { id: "medium", icon: "🟡", label: "Medium", color: "#D97706", bg: "#FFFBEB", borderColor: "#FDE68A", desc: "Normal speed (140 ms) · 12 rounds · standard" },
    { id: "hard",   icon: "🔴", label: "Hard",   color: "#DC2626", bg: "#FEF2F2", borderColor: "#FECACA", desc: "Fast flashes (100 ms) · 16 rounds · intense" },
  ];

  function makeStream() {
    const lag   = rand(1, cfg.lagMax);
    const t1pos = 4;
    const t2pos = t1pos + lag;
    return { lag, stream: Array.from({ length: t2pos + 3 }, (_, i) => {
      if (i === t1pos) return String(rand(1, 9));
      if (i === t2pos) return "X";
      return choice(LETTERS.filter(l => l !== "X"));
    })};
  }

  function begin() { setRows([]); setPhase("running"); next(0); }

  function next(n) {
    const { lag, stream } = makeStream();
    trialRef.current = { lag, n };
    setShowQ(false); setCurrent("");
    let i = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (i < stream.length) { setCurrent(stream[i]); i++; }
      else { clearInterval(timerRef.current); setCurrent(""); setShowQ(true); }
    }, cfg.interval);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  function answer(saw) {
    const { lag, n } = trialRef.current;
    const nr = [...rows, { lag, saw }];
    setRows(nr);
    setShowQ(false);
    if (n >= cfg.total - 1) { setPhase("done"); return; }
    setTimeout(() => next(n + 1), 600);
  }

  const short    = rows.filter(r => r.lag <= 3);
  const long     = rows.filter(r => r.lag >= 4);
  const shortHit = short.filter(r => r.saw).length;
  const longHit  = long.filter(r => r.saw).length;
  const shortPct = short.length ? Math.round(shortHit / short.length * 100) : 0;
  const longPct  = long.length  ? Math.round(longHit  / long.length  * 100) : 0;
  const blinkGap = longPct - shortPct;

  function evalScore() {
    if (!short.length || !long.length) return "Not enough data to evaluate — try again with more rounds.";
    if (blinkGap >= 35) return `Big blink (${blinkGap}% gap). Your brain really struggled to catch X right after seeing the digit. This is very normal — most people have a large blink.`;
    if (blinkGap >= 20) return `Moderate blink (${blinkGap}% gap). You missed X fairly often when it appeared quickly. Typical result.`;
    if (blinkGap >= 5)  return `Small blink (${blinkGap}% gap). Your attention bounced back quickly — good control.`;
    return `Almost no blink! You caught X reliably even at short lags. That's impressive attentional control.`;
  }

  const scoreEval = (
    <div style={{ background: "var(--blue-light)", border: "1px solid var(--blue-mid)", borderRadius: "var(--radius)", padding: "14px 16px", marginTop: 12 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6, fontWeight: 600 }}>what your score means</div>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>{evalScore()}</p>
    </div>
  );

  if (!picked) {
    return (
      <LevelPicker
        title="Attentional Blink"
        levels={LEVELS}
        onPick={d => { setDifficulty(d); setPicked(true); setRows([]); setPhase("intro"); }}
      />
    );
  }

  return (
    <GameShell
      cite="Raymond et al., 1992"
      instructions={<ol>
        <li>A stream of letters flashes rapidly.</li>
        <li>Watch for a <strong>digit 1–9</strong> — that's your first target.</li>
        <li>Also watch for the letter <strong>X</strong> — that's your second target.</li>
        <li>After each stream, say whether you saw X. ({cfg.total} rounds · {difficulty})</li>
      </ol>}
      phase={phase} headline="catch the blink"
      explain="Your brain briefly 'blinks' after spotting the first target, making you miss the second one."
      onBegin={begin}
      onReset={() => { setRows([]); setPicked(false); setPhase("intro"); }}
      footer={`stream ${rows.length + 1}/${cfg.total} · ${difficulty}`}
      results={[
        { label: "short lag (≤3)", value: short.length ? `${shortPct}%` : "–" },
        { label: "long lag (≥4)",  value: long.length  ? `${longPct}%`  : "–" },
        { label: "blink gap",      value: (short.length && long.length) ? `${blinkGap}%` : "–" }
      ]}
      doneText="After spotting a digit, your brain takes ~500 ms to reset — X appearing in that window often goes invisible."
      doneExtra={scoreEval}
    >
      <div className="center-stack">
        {current ? (
          <div className="stimulus" style={{
            color: /\d/.test(current) ? "#2563EB" : current === "X" ? "#DC2626" : "var(--text)",
            fontFamily: "'JetBrains Mono', monospace", minWidth: 80, textAlign: "center",
            transition: "color 0.05s"
          }}>{current}</div>
        ) : showQ ? (
          <>
            <p className="task-explain">Did you see the letter <strong>X</strong> in that stream?</p>
            <div className="choice-row">
              <button className="choice-btn" onClick={() => answer(true)}>Yes — saw X</button>
              <button className="choice-btn" onClick={() => answer(false)}>No X</button>
            </div>
          </>
        ) : (
          <div className="mono-big" style={{ opacity: 0.15 }}>·</div>
        )}
      </div>
    </GameShell>
  );
}

/* ── SART — Sustained Attention to Response Task ───────────────────── */
function SART() {
  const [phase, setPhase]     = useState("intro");
  const [picked, setPicked]   = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [current, setCurrent] = useState("");
  const [n, setN]             = useState(0);
  const rowsRef = useRef([]);
  const [rows, setRows]       = useState([]);
  const timerRef = useRef(null);

  const CONFIGS = {
    easy:   { showMs: 1200, gapMs: 300, total: 12 },
    medium: { showMs: 900,  gapMs: 200, total: 18 },
    hard:   { showMs: 600,  gapMs: 150, total: 25 },
  };
  const cfg = CONFIGS[difficulty];

  const LEVELS = [
    { id: "easy",   icon: "🟢", label: "Easy",   color: "#059669", bg: "#ECFDF5", borderColor: "#A7F3D0", desc: "1.2 s per digit · 12 digits · relaxed pace" },
    { id: "medium", icon: "🟡", label: "Medium", color: "#D97706", bg: "#FFFBEB", borderColor: "#FDE68A", desc: "0.9 s per digit · 18 digits · standard pace" },
    { id: "hard",   icon: "🔴", label: "Hard",   color: "#DC2626", bg: "#FEF2F2", borderColor: "#FECACA", desc: "0.6 s per digit · 25 digits · fast pace" },
  ];

  function begin() {
    rowsRef.current = [];
    setRows([]); setN(0); setCurrent("");
    setPhase("running");
    showNext(0);
  }

  function showNext(idx) {
    if (idx >= cfg.total) { setPhase("done"); return; }
    const digit = rand(1, 9);
    const isNogo = digit === 3;
    setCurrent(String(digit));
    setN(idx);
    let pressed = false;

    function onKey(e) {
      if (e.code !== "Space" && e.key !== " ") return;
      e.preventDefault();
      pressed = true;
      const nr = [...rowsRef.current, { digit, isNogo, pressed: true }];
      rowsRef.current = nr;
      setRows([...nr]);
    }
    window.addEventListener("keydown", onKey);

    timerRef.current = setTimeout(() => {
      window.removeEventListener("keydown", onKey);
      if (!pressed) {
        const nr = [...rowsRef.current, { digit, isNogo, pressed: false }];
        rowsRef.current = nr;
        setRows([...nr]);
      }
      setCurrent("");
      setTimeout(() => showNext(idx + 1), cfg.gapMs);
    }, cfg.showMs);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const commissions = rows.filter(r => r.isNogo && r.pressed).length;
  const omissions   = rows.filter(r => !r.isNogo && !r.pressed).length;
  const accuracy    = rows.length ? Math.round((rows.length - commissions - omissions) / rows.length * 100) : 0;

  function evalScore() {
    if (!rows.length) return "No data yet.";
    if (commissions === 0 && omissions === 0) return "Perfect! You pressed every right digit and never pressed for 3. Your focus was excellent.";
    if (commissions === 0) return `Great impulse control — you never pressed for 3. You missed ${omissions} digit${omissions > 1 ? "s" : ""}, which means attention drifted at times.`;
    if (omissions === 0)   return `You responded to every digit, but pressed for 3 ${commissions} time${commissions > 1 ? "s" : ""}. That's impulsivity — your brain jumped before checking the rule.`;
    if (accuracy >= 85)    return `Good overall (${accuracy}%). A few slips — ${commissions} impulsive press${commissions !== 1 ? "es" : ""} and ${omissions} missed digit${omissions !== 1 ? "s" : ""}. Totally normal.`;
    if (accuracy >= 65)    return `Moderate (${accuracy}%). ${commissions} press${commissions !== 1 ? "es" : ""} on 3 and ${omissions} missed digit${omissions !== 1 ? "s" : ""}. Focus tends to improve with practice.`;
    return `Tough run (${accuracy}%). This task is genuinely hard — the point is to see how focus holds under pressure, not to be perfect.`;
  }

  const scoreEval = (
    <div style={{ background: "var(--blue-light)", border: "1px solid var(--blue-mid)", borderRadius: "var(--radius)", padding: "14px 16px", marginTop: 12 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6, fontWeight: 600 }}>what your score means</div>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>{evalScore()}</p>
    </div>
  );

  if (!picked) {
    return (
      <LevelPicker
        title="SART"
        levels={LEVELS}
        onPick={d => { setDifficulty(d); setPicked(true); rowsRef.current = []; setRows([]); setPhase("intro"); }}
      />
    );
  }

  return (
    <GameShell
      cite="Robertson et al., 1997"
      instructions={<ol>
        <li>Digits appear one at a time ({cfg.showMs / 1000} s each).</li>
        <li>Press <span className="kbd">Space</span> for <strong>every digit except 3</strong>.</li>
        <li>When you see 3, hold back — do not press. ({cfg.total} digits · {difficulty})</li>
      </ol>}
      phase={phase} headline="don't press three"
      explain="A focus test — keeping a rule alive while resisting occasional impulses."
      onBegin={begin}
      onReset={() => { rowsRef.current = []; setRows([]); setPicked(false); setPhase("intro"); }}
      footer={`digit ${Math.min(n + 1, cfg.total)}/${cfg.total} · ${difficulty}`}
      results={[
        { label: "commissions", value: commissions },
        { label: "omissions",   value: omissions },
        { label: "accuracy",    value: `${accuracy}%` }
      ]}
      doneText="Pressing for 3 = impulsivity. Missing go digits = inattention. Both tell you something different."
      doneExtra={scoreEval}
    >
      <div className="center-stack">
        <div className="stimulus" style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: current === "3" ? "#DC2626" : "var(--text)"
        }}>{current || "·"}</div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { AttentionalBlink, SART });
}
