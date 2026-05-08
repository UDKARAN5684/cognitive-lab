{
const { GameShell, choice, rand, useEffect, useRef, useState } = window.GameKit;

/* ── Attentional Blink ──────────────────────────────────────────────── */
function AttentionalBlink() {
  const [phase, setPhase]   = useState("intro");
  const [current, setCurrent] = useState("");
  const [showQ, setShowQ]   = useState(false);
  const [rows, setRows]     = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const trialRef = useRef({ lag: 0, n: 0 });
  const timerRef = useRef(null);
  const LETTERS = "ABCDEFGHJKLMNOPQRSTUVWYZ".split("");

  const CONFIGS = {
    easy:   { interval: 200, total: 8,  lagMax: 4 },
    medium: { interval: 140, total: 12, lagMax: 6 },
    hard:   { interval: 100, total: 16, lagMax: 6 },
  };
  const cfg = CONFIGS[difficulty];

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
    if (blinkGap >= 35) return `Big blink detected (${blinkGap}% gap). Your brain struggled hard to catch X right after seeing the digit. This is very normal — it just means your attention reset slowly.`;
    if (blinkGap >= 20) return `Moderate blink (${blinkGap}% gap). You missed X fairly often when it appeared quickly after the digit. Typical for most people.`;
    if (blinkGap >= 5)  return `Small blink (${blinkGap}% gap). You handled the rapid switch well — your attention bounced back quickly.`;
    return `Almost no blink! You caught X reliably even at short lags. That's impressive attentional control.`;
  }

  const difficultySelector = (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Difficulty</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["easy", "medium", "hard"].map(d => (
          <button key={d} onClick={() => setDifficulty(d)} style={{
            flex: 1, padding: "8px 4px", border: `1px solid ${difficulty === d ? "var(--blue)" : "var(--border)"}`,
            background: difficulty === d ? "var(--blue)" : "var(--bg-2)",
            color: difficulty === d ? "#fff" : "var(--text-2)",
            borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            transition: "var(--transition)"
          }}>{d}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 6 }}>
        {difficulty === "easy" ? "Slower flashes · 8 rounds" : difficulty === "medium" ? "Normal speed · 12 rounds" : "Fast flashes · 16 rounds"}
      </div>
    </div>
  );

  const scoreEval = (
    <div style={{ background: "var(--blue-light)", border: "1px solid var(--blue-mid)", borderRadius: "var(--radius)", padding: "14px 16px", marginTop: 12 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6, fontWeight: 600 }}>what your score means</div>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>{evalScore()}</p>
    </div>
  );

  return (
    <GameShell
      cite="Raymond et al., 1992"
      instructions={<>
        <ol>
          <li>A stream of letters flashes rapidly.</li>
          <li>Watch for a <strong>digit 1–9</strong> — that's your first target.</li>
          <li>Also watch for the letter <strong>X</strong> — that's your second target.</li>
          <li>After each stream, say whether you saw X.</li>
        </ol>
        {difficultySelector}
      </>}
      phase={phase} headline="catch the blink"
      explain="Your brain briefly 'blinks' after spotting the first target, making you miss the second one."
      onBegin={begin} onReset={() => { setRows([]); setPhase("intro"); }}
      footer={`stream ${rows.length + 1}/${cfg.total} · ${difficulty}`}
      results={[
        { label: "short lag (≤3)", value: short.length ? `${shortPct}%` : "–" },
        { label: "long lag (≥4)",  value: long.length  ? `${longPct}%`  : "–" },
        { label: "blink gap",      value: (short.length && long.length) ? `${blinkGap}%` : "–" }
      ]}
      doneText="After spotting a digit, your brain takes ~500 ms to reset — the letter X appearing in that window often goes invisible."
      doneExtra={scoreEval}
    />
  );
}

/* ── SART — Sustained Attention to Response Task ───────────────────── */
function SART() {
  const [phase, setPhase]   = useState("intro");
  const [current, setCurrent] = useState("");
  const [n, setN]           = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const rowsRef = useRef([]);
  const [rows, setRows]     = useState([]);
  const timerRef = useRef(null);

  const CONFIGS = {
    easy:   { showMs: 1200, gapMs: 300, total: 12 },
    medium: { showMs: 900,  gapMs: 200, total: 18 },
    hard:   { showMs: 600,  gapMs: 150, total: 25 },
  };
  const cfg = CONFIGS[difficulty];

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
    if (commissions === 0 && omissions === 0) return `Perfect score! You pressed every right digit and never pressed for 3. Your sustained focus was excellent.`;
    if (commissions === 0) return `Great impulse control — you never pressed for 3. You missed ${omissions} digit${omissions > 1 ? "s" : ""} though, which can mean your attention drifted at times.`;
    if (omissions === 0) return `You responded to every digit, but pressed for 3 ${commissions} time${commissions > 1 ? "s" : ""}. That suggests some impulsivity — your brain jumped ahead before checking the rule.`;
    if (accuracy >= 85)  return `Good overall (${accuracy}%). A few slips — ${commissions} impulsive press${commissions !== 1 ? "es" : ""} and ${omissions} missed digit${omissions !== 1 ? "s" : ""}. Totally normal for this task.`;
    if (accuracy >= 65)  return `Moderate accuracy (${accuracy}%). ${commissions} press${commissions !== 1 ? "es" : ""} on 3 (impulsivity) and ${omissions} missed digit${omissions !== 1 ? "s" : ""} (inattention). Try again — focus tends to improve with practice.`;
    return `Tough run (${accuracy}%). This task is genuinely hard. Don't worry — the point is to see how your focus holds up under pressure, not to be perfect.`;
  }

  const difficultySelector = (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Difficulty</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["easy", "medium", "hard"].map(d => (
          <button key={d} onClick={() => setDifficulty(d)} style={{
            flex: 1, padding: "8px 4px", border: `1px solid ${difficulty === d ? "var(--blue)" : "var(--border)"}`,
            background: difficulty === d ? "var(--blue)" : "var(--bg-2)",
            color: difficulty === d ? "#fff" : "var(--text-2)",
            borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            transition: "var(--transition)"
          }}>{d}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 6 }}>
        {difficulty === "easy" ? "1.2 s per digit · 12 total" : difficulty === "medium" ? "0.9 s per digit · 18 total" : "0.6 s per digit · 25 total"}
      </div>
    </div>
  );

  const scoreEval = (
    <div style={{ background: "var(--blue-light)", border: "1px solid var(--blue-mid)", borderRadius: "var(--radius)", padding: "14px 16px", marginTop: 12 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6, fontWeight: 600 }}>what your score means</div>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>{evalScore()}</p>
    </div>
  );

  return (
    <GameShell
      cite="Robertson et al., 1997"
      instructions={<>
        <ol>
          <li>Digits appear one at a time.</li>
          <li>Press <span className="kbd">Space</span> for <strong>every digit except 3</strong>.</li>
          <li>When you see 3, hold back — do not press anything.</li>
        </ol>
        {difficultySelector}
      </>}
      phase={phase} headline="don't press three"
      explain="A focus test — keeping a rule alive while resisting occasional impulses."
      onBegin={begin} onReset={() => { setRows([]); setPhase("intro"); }}
      footer={`digit ${Math.min(n + 1, cfg.total)}/${cfg.total} · ${difficulty}`}
      results={[
        { label: "commissions", value: commissions },
        { label: "omissions",   value: omissions },
        { label: "accuracy",    value: `${accuracy}%` }
      ]}
      doneText="Pressing for 3 = impulsivity. Missing go digits = inattention. Both tell you something different about focus."
      doneExtra={scoreEval}
    />
  );
}

Object.assign(window, { AttentionalBlink, SART });
}
