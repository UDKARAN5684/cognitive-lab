{
const { GameShell, rand, shuffle, useEffect, useRef, useState } = window.GameKit;

/* ── Prospective Memory ─────────────────────────────────────────────── */
function ProspectiveMemory() {
  // Simple counting task; remember to press a special key when you see target
  const TARGETS = ["elephant", "umbrella", "volcano"];
  const wordPool = shuffle([
    "apple","window","river","cloud","table","forest","camera","bridge",
    "garden","pencil","mirror","island","candle","stone","market","planet",
    "basket","ladder","engine","bottle","trumpet","shadow","pillow","carpet",
    ...TARGETS,
  ]).slice(0, 24);

  const [phase, setPhase]       = useState("intro");
  const [wordIdx, setWordIdx]   = useState(0);
  const [current, setCurrent]   = useState("");
  const [rows, setRows]         = useState([]);
  const [flagged, setFlagged]   = useState(new Set());
  const timerRef = useRef(null);
  const rowsRef  = useRef([]);
  const flagRef  = useRef(new Set());
  const idxRef   = useRef(0);
  const wordsRef = useRef(wordPool);

  function begin() {
    rowsRef.current = []; flagRef.current = new Set(); idxRef.current = 0;
    setRows([]); setFlagged(new Set()); setWordIdx(0); setPhase("running");
    showWord();
  }

  function showWord() {
    const words = wordsRef.current;
    const i = idxRef.current;
    if (i >= words.length) { setPhase("done"); return; }
    setCurrent(words[i]);
    timerRef.current = setTimeout(() => {
      idxRef.current++;
      showWord();
    }, 1600);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function flag() {
    const word = wordsRef.current[idxRef.current - 1] || wordsRef.current[idxRef.current];
    if (!word) return;
    const next = new Set(flagRef.current);
    next.add(word);
    flagRef.current = next;
    setFlagged(new Set(next));
  }

  const hits      = TARGETS.filter(t => flagRef.current.has(t)).length;
  const misses    = TARGETS.length - hits;
  const falsePos  = [...flagRef.current].filter(w => !TARGETS.includes(w)).length;

  return (
    <GameShell
      cite="Brandimonte et al., 1992"
      instructions={<ol>
        <li>Words flash one at a time. Your job: <strong>count them silently</strong>.</li>
        <li>BUT — if you see <strong>elephant, umbrella, or volcano</strong>, tap the <strong>Flag!</strong> button.</li>
        <li>These three target words are hidden among 24 total words.</li>
        <li>The catch: you must hold the intention in mind while doing something else.</li>
      </ol>}
      phase={phase} headline="remember while you do"
      explain="Prospective memory is remembering to do something in the future — the most everyday and failure-prone memory type."
      onBegin={begin} onReset={begin}
      footer={`word ${Math.min(idxRef.current + 1, wordPool.length)}/${wordPool.length}`}
      results={[
        { label: "targets caught",   value: `${hits}/${TARGETS.length}` },
        { label: "targets missed",   value: misses },
        { label: "false flags",      value: falsePos },
        { label: "PM performance",   value: hits === 3 && falsePos === 0 ? "perfect" : hits >= 2 ? "good" : "partial" }
      ]}
      doneText="Prospective memory failures are behind most everyday slip-ups: forgetting to take medicine, missing a meeting. Holding an intention while doing something else is genuinely hard."
    >
      <div className="center-stack">
        <div className="mono-big" style={{ minHeight: 64, fontSize: 36, letterSpacing: "0.04em" }}>{current}</div>
        <button
          className="primary-btn"
          style={{ marginTop: 8, background: "#DC2626", borderColor: "#DC2626", fontSize: 16, padding: "12px 32px" }}
          onClick={flag}
        >
          🚩 Flag!
        </button>
        <p style={{ fontSize: 12, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace" }}>
          Press Flag when you see: elephant · umbrella · volcano
        </p>
        {flagged.size > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {[...flagged].map(w => (
              <span key={w} className="pill" style={{ fontSize: 12, background: TARGETS.includes(w) ? "#D1FAE5" : "#FEE2E2", color: TARGETS.includes(w) ? "#059669" : "#DC2626" }}>{w}</span>
            ))}
          </div>
        )}
      </div>
    </GameShell>
  );
}

/* ── Dual Task ──────────────────────────────────────────────────────── */
function DualTask() {
  // Phase 1: single task (just tap the blue circle)
  // Phase 2: dual task (tap blue circle AND say if a tone is high or low)
  const N = 12;
  const tones = shuffle([...Array(6).fill("high"), ...Array(6).fill("low")]);

  const [phase, setPhase]       = useState("intro");
  const [taskMode, setTaskMode] = useState("single"); // "single" | "dual"
  const [circleOn, setCircleOn] = useState(false);
  const [toneLabel, setTone]    = useState("");
  const [rows, setRows]         = useState([]);
  const [toneRows, setToneRows] = useState([]);
  const timerRef  = useRef(null);
  const appearRef = useRef(0);
  const trialRef  = useRef(0);
  const toneIdxRef = useRef(0);
  const rowsRef   = useRef([]);
  const toneRowsRef = useRef([]);
  const modeRef   = useRef("single");

  function startMode(mode) {
    modeRef.current = mode;
    rowsRef.current = []; toneRowsRef.current = [];
    trialRef.current = 0; toneIdxRef.current = 0;
    setRows([]); setToneRows([]); setCircleOn(false); setTone("");
    setTaskMode(mode);
    nextTrial();
  }

  function begin() { setPhase("running"); startMode("single"); }

  function nextTrial() {
    const i = trialRef.current;
    if (i >= N) {
      if (modeRef.current === "single") {
        // transition to dual
        setTimeout(() => startMode("dual"), 800);
      } else {
        setPhase("done");
      }
      return;
    }
    const delay = 1200 + rand(0, 1000);
    timerRef.current = setTimeout(() => {
      setCircleOn(true);
      appearRef.current = Date.now();
      if (modeRef.current === "dual") {
        setTone(tones[toneIdxRef.current % tones.length]);
      }
    }, delay);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function tapCircle() {
    if (!circleOn) return;
    const rt = Date.now() - appearRef.current;
    rowsRef.current = [...rowsRef.current, rt];
    setRows([...rowsRef.current]);
    setCircleOn(false); setTone("");
    trialRef.current++;
    nextTrial();
  }

  function pickTone(ans) {
    const correct = ans === toneLabel;
    toneRowsRef.current = [...toneRowsRef.current, correct];
    setToneRows([...toneRowsRef.current]);
    toneIdxRef.current++;
    setTone("");
  }

  const singleRows = rows.slice(0, N);
  const dualRows   = rows.slice(N);
  const singleAvg  = singleRows.length ? Math.round(singleRows.reduce((s, v) => s + v, 0) / singleRows.length) : 0;
  const dualAvg    = dualRows.length   ? Math.round(dualRows.reduce((s, v) => s + v, 0)   / dualRows.length)   : 0;
  const toneAcc    = toneRows.length   ? Math.round(toneRows.filter(Boolean).length / toneRows.length * 100) : 0;
  const rtCost     = dualAvg && singleAvg ? dualAvg - singleAvg : 0;

  return (
    <GameShell
      cite="Pashler, 1994"
      instructions={<ol>
        <li>A blue circle appears — tap it as fast as you can. (12 taps, single task.)</li>
        <li>Then the same circle appears again, but now you also hear "high" or "low".</li>
        <li>Tap the circle AND choose high or low before the next one appears.</li>
        <li>Your speed will drop — that cost is the dual-task penalty.</li>
      </ol>}
      phase={phase} headline="two things at once"
      explain="Multitasking has a measurable cost. Your brain switches tasks rather than truly parallel-processing."
      onBegin={begin} onReset={begin}
      footer={taskMode === "single" ? `single task · ${trialRef.current}/${N}` : `dual task · ${trialRef.current - N < 0 ? 0 : trialRef.current - N}/${N}`}
      results={[
        { label: "single-task avg RT", value: `${singleAvg} ms` },
        { label: "dual-task avg RT",   value: `${dualAvg} ms` },
        { label: "RT cost",            value: `+${rtCost} ms` },
        { label: "tone accuracy",      value: `${toneAcc}%` }
      ]}
      doneText="The dual-task cost (extra ms) is the price your brain pays for divided attention. It's why texting while driving is genuinely dangerous."
    >
      <div className="center-stack">
        {taskMode === "dual" && (
          <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            dual task mode
          </div>
        )}
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <div
            onClick={tapCircle}
            style={{
              width: 120, height: 120, borderRadius: "50%",
              background: circleOn ? "var(--blue)" : "var(--surface)",
              border: `3px solid ${circleOn ? "var(--blue)" : "var(--border)"}`,
              cursor: circleOn ? "pointer" : "default",
              transition: "background 0.1s, border-color 0.1s",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: circleOn ? "#fff" : "var(--text-4)", fontFamily: "'JetBrains Mono', monospace",
              userSelect: "none",
            }}
          >
            {circleOn ? "TAP!" : "wait…"}
          </div>
        </div>
        {toneLabel && (
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button className="choice-btn" style={{ color: toneLabel === "high" ? "var(--blue)" : undefined }} onClick={() => pickTone("high")}>High ↑</button>
            <button className="choice-btn" style={{ color: toneLabel === "low" ? "var(--blue)" : undefined }} onClick={() => pickTone("low")}>Low ↓</button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

Object.assign(window, { ProspectiveMemory, DualTask });
}
