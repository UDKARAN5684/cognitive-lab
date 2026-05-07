{
const { GameShell, rand, shuffle, useEffect, useRef, useState } = window.GameKit;

/* ── Timing Accuracy (Time Reproduction) ───────────────────────────── */
function TimingAccuracy() {
  const TARGETS = [500, 1000, 1500, 2000, 800, 1200, 600, 1800]; // ms
  const N = TARGETS.length;

  const [phase, setPhase]   = useState("intro");
  const [step, setStep]     = useState("wait"); // "wait" | "demo" | "reproduce"
  const [idx, setIdx]       = useState(0);
  const [rows, setRows]     = useState([]);
  const [btnLabel, setBtn]  = useState("Hold to start interval");
  const holdStart = useRef(0);
  const timerRef  = useRef(null);

  function begin() { setIdx(0); setRows([]); setStep("wait"); setPhase("running"); setBtn("Hold to start"); }

  // Demo phase: show the target duration visually
  function startDemo() {
    setStep("demo"); setBtn("Timing…");
    timerRef.current = setTimeout(() => {
      setStep("reproduce"); setBtn("Hold for the same duration");
    }, TARGETS[idx]);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function holdDown() {
    if (step !== "reproduce") return;
    holdStart.current = Date.now();
  }

  function holdUp() {
    if (step !== "reproduce" || !holdStart.current) return;
    const held = Date.now() - holdStart.current;
    holdStart.current = 0;
    const error = Math.abs(held - TARGETS[idx]);
    const nr = [...rows, { target: TARGETS[idx], held, error }];
    setRows(nr);
    const nextIdx = idx + 1;
    if (nextIdx >= N) { setPhase("done"); return; }
    setIdx(nextIdx);
    setStep("wait");
    setBtn("Hold to start next interval");
  }

  const avgErr  = rows.length ? Math.round(rows.reduce((s, r) => s + r.error, 0) / rows.length) : 0;
  const pctErr  = rows.length ? Math.round(rows.reduce((s, r) => s + r.error / r.target, 0) / rows.length * 100) : 0;

  const target = TARGETS[idx] ?? 1000;

  return (
    <GameShell
      cite="Fraisse, 1963"
      instructions={<ol>
        <li>A timer runs for a hidden duration — watch the progress bar.</li>
        <li>After it stops, <strong>hold the button</strong> for the exact same duration.</li>
        <li>Release when you think the time is up.</li>
        <li>8 intervals, getting harder. No numbers shown.</li>
      </ol>}
      phase={phase} headline="feel the beat"
      explain="Your internal clock is surprisingly accurate — but emotions, age, and attention all warp it."
      onBegin={begin} onReset={begin}
      footer={`interval ${idx + 1}/${N}`}
      results={[
        { label: "avg error",   value: `${avgErr} ms` },
        { label: "avg % error", value: `${pctErr}%` },
        { label: "clock sense", value: pctErr <= 10 ? "excellent" : pctErr <= 20 ? "good" : "typical" }
      ]}
      doneText="Most people have 10–20% timing error. Your internal clock runs faster under stress and slower when bored — explaining why waiting feels longer than playing."
    >
      <div className="center-stack" style={{ gap: 20 }}>
        <p className="task-explain" style={{ color: "var(--text-3)", marginBottom: 4 }}>
          {step === "wait" ? "Ready? Press to see the interval." : step === "demo" ? "Watch the interval…" : "Now reproduce it — hold the button below."}
        </p>
        {/* progress bar shown during demo */}
        <div style={{ width: "min(320px,90%)", height: 10, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 6,
            background: "var(--blue)",
            width: step === "demo" ? "100%" : "0%",
            transition: step === "demo" ? `width ${target}ms linear` : "none"
          }} />
        </div>
        {step === "wait" && (
          <button className="primary-btn" onClick={startDemo}>Start interval →</button>
        )}
        {step === "reproduce" && (
          <button
            className="primary-btn"
            onMouseDown={holdDown} onMouseUp={holdUp}
            onTouchStart={holdDown} onTouchEnd={holdUp}
            style={{ padding: "18px 40px", fontSize: 16, userSelect: "none" }}
          >
            Hold…
          </button>
        )}
        {rows.length > 0 && (
          <div style={{ fontSize: 12, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace" }}>
            Last: target {rows[rows.length-1].target}ms · you held {rows[rows.length-1].held}ms · error {rows[rows.length-1].error}ms
          </div>
        )}
      </div>
    </GameShell>
  );
}

/* ── Choice RT — Hick's Law ─────────────────────────────────────────── */
function ChoiceRT() {
  // N choices per block: 2, 4, 8
  const BLOCKS = [
    { n: 2,  label: "2 choices",  keys: ["A","B"] },
    { n: 4,  label: "4 choices",  keys: ["A","B","C","D"] },
    { n: 8,  label: "8 choices",  keys: ["A","B","C","D","E","F","G","H"] },
  ];
  const TRIALS_PER_BLOCK = 8;

  const [phase, setPhase]   = useState("intro");
  const [blockIdx, setBlock] = useState(0);
  const [trialIdx, setTrial] = useState(0);
  const [target, setTarget] = useState("");
  const [rows, setRows]     = useState([]);
  const [waiting, setWaiting] = useState(true);
  const timerRef  = useRef(null);
  const appearRef = useRef(0);
  const rowsRef   = useRef([]);
  const blockRef  = useRef(0);
  const trialRef  = useRef(0);

  function begin() {
    rowsRef.current = []; blockRef.current = 0; trialRef.current = 0;
    setRows([]); setBlock(0); setTrial(0); setTarget(""); setWaiting(true);
    setPhase("running");
    nextTrial(0, 0);
  }

  function nextTrial(bIdx, tIdx) {
    const block = BLOCKS[bIdx];
    const delay = 800 + rand(0, 600);
    setWaiting(true); setTarget("");
    timerRef.current = setTimeout(() => {
      const t = block.keys[Math.floor(Math.random() * block.n)];
      setTarget(t);
      appearRef.current = Date.now();
      setWaiting(false);
    }, delay);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function pick(key) {
    if (waiting || !target) return;
    const rt = Date.now() - appearRef.current;
    const correct = key === target;
    rowsRef.current = [...rowsRef.current, { block: blockRef.current, rt, correct }];
    setRows([...rowsRef.current]);
    const nextTrial2 = trialRef.current + 1;
    if (nextTrial2 >= TRIALS_PER_BLOCK) {
      const nextBlock = blockRef.current + 1;
      if (nextBlock >= BLOCKS.length) { setPhase("done"); return; }
      blockRef.current = nextBlock;
      trialRef.current = 0;
      setBlock(nextBlock); setTrial(0);
      nextTrial(nextBlock, 0);
    } else {
      trialRef.current = nextTrial2;
      setTrial(nextTrial2);
      nextTrial(blockRef.current, nextTrial2);
    }
  }

  // Compute per-block averages
  const blockAvgs = BLOCKS.map((_, bi) => {
    const br = rowsRef.current.filter(r => r.block === bi);
    return br.length ? Math.round(br.filter(r=>r.correct).reduce((s,r)=>s+r.rt,0) / Math.max(br.filter(r=>r.correct).length,1)) : null;
  });

  const block = BLOCKS[blockIdx] || BLOCKS[0];
  const tIdx  = trialIdx;

  return (
    <GameShell
      cite="Hick, 1952"
      instructions={<ol>
        <li>A highlighted letter appears among the buttons — press it as fast as you can.</li>
        <li>You'll go through <strong>three blocks</strong>: 2, 4, and 8 choices.</li>
        <li>As choices double, your reaction time should increase logarithmically.</li>
        <li>8 trials per block = 24 total. Speed and accuracy both count.</li>
      </ol>}
      phase={phase} headline="how does complexity slow you?"
      explain="Hick's Law: every time you double the number of options, reaction time grows by a fixed amount."
      onBegin={begin} onReset={begin}
      footer={`${block.label} · trial ${tIdx + 1}/${TRIALS_PER_BLOCK}`}
      results={[
        { label: "2-choice avg RT",  value: blockAvgs[0] ? `${blockAvgs[0]} ms` : "—" },
        { label: "4-choice avg RT",  value: blockAvgs[1] ? `${blockAvgs[1]} ms` : "—" },
        { label: "8-choice avg RT",  value: blockAvgs[2] ? `${blockAvgs[2]} ms` : "—" },
        { label: "Hick's slope",     value: blockAvgs[0] && blockAvgs[2] ? `+${blockAvgs[2] - blockAvgs[0]} ms` : "—" }
      ]}
      doneText="Hick's Law: RT ≈ a + b·log₂(n). The slope b is your decision efficiency. Experts in fast-paced tasks flatten this curve through pattern recognition."
    >
      <div className="center-stack">
        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          {block.label} — press the highlighted letter
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: "min(400px,90%)" }}>
          {block.keys.map(k => (
            <button
              key={k}
              className="choice-btn"
              onClick={() => pick(k)}
              style={{
                minWidth: 56, fontSize: 22, fontWeight: 800, padding: "14px 10px",
                background: k === target && !waiting ? "var(--blue)" : undefined,
                color: k === target && !waiting ? "#fff" : undefined,
                borderColor: k === target && !waiting ? "var(--blue)" : undefined,
                transition: "background 0.08s, color 0.08s",
                transform: k === target && !waiting ? "scale(1.08)" : "scale(1)",
              }}
            >{k}</button>
          ))}
        </div>
        {waiting && (
          <p style={{ fontSize: 12, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace" }}>get ready…</p>
        )}
      </div>
    </GameShell>
  );
}

Object.assign(window, { TimingAccuracy, ChoiceRT });
}
