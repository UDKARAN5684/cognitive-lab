{
const { GameShell, choice, mean, rand, useEffect, useRef, useState } = window.GameKit;

/* ── Attentional Blink ──────────────────────────────────────────────── */
function AttentionalBlink() {
  const [phase, setPhase]   = useState("intro");
  const [current, setCurrent] = useState("");
  const [showQ, setShowQ]   = useState(false);
  const [rows, setRows]     = useState([]);
  const trialRef = useRef({ lag: 0, n: 0 });
  const timerRef = useRef(null);
  const LETTERS = "ABCDEFGHJKLMNOPQRSTUVWYZ".split("");
  const N = 12;

  function makeStream() {
    const lag   = rand(1, 6);
    const t1pos = 4;
    const t2pos = t1pos + lag;
    return { lag, stream: Array.from({ length: 14 }, (_, i) => {
      if (i === t1pos) return String(rand(1, 9));
      if (i === t2pos) return "X";
      return choice(LETTERS.filter(l => l !== "X"));
    })};
  }

  function begin() { setRows([]); setPhase("running"); next(0, []); }

  function next(n, currentRows) {
    const { lag, stream } = makeStream();
    trialRef.current = { lag, n };
    setShowQ(false); setCurrent("");
    let i = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (i < stream.length) { setCurrent(stream[i]); i++; }
      else { clearInterval(timerRef.current); setCurrent(""); setShowQ(true); }
    }, 140);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  function answer(saw) {
    const { lag, n } = trialRef.current;
    const nr = [...rows, { lag, saw }];
    setRows(nr);
    setShowQ(false);
    if (n >= N - 1) { setPhase("done"); return; }
    setTimeout(() => next(n + 1, nr), 600);
  }

  const short = rows.filter(r => r.lag <= 3);
  const long  = rows.filter(r => r.lag >= 4);
  const shortHit = short.filter(r => r.saw).length;
  const longHit  = long.filter(r => r.saw).length;
  const shortPct = short.length ? Math.round(shortHit / short.length * 100) : 0;
  const longPct  = long.length  ? Math.round(longHit  / long.length  * 100) : 0;

  return (
    <GameShell
      cite="Raymond et al., 1992"
      instructions={<ol>
        <li>A stream of letters flashes rapidly — one every 140 ms.</li>
        <li>Watch for a <strong>digit 1–9</strong> — that's your first target.</li>
        <li>Also watch for the letter <strong>X</strong> — that's your second target.</li>
        <li>After each stream, say whether you saw X. 12 streams total.</li>
      </ol>}
      phase={phase} headline="catch the blink"
      explain="Your brain briefly 'blinks' after spotting the first target, making you miss the second one."
      onBegin={begin} onReset={begin}
      footer={`stream ${rows.length + 1}/${N}`}
      results={[
        { label: "short lag (≤3)", value: short.length ? `${shortPct}%` : "–" },
        { label: "long lag (≥4)",  value: long.length  ? `${longPct}%`  : "–" },
        { label: "blink gap",      value: (short.length && long.length) ? `${longPct - shortPct}%` : "–" }
      ]}
      doneText="After spotting a digit, your brain takes ~500 ms to reset — the letter X appearing in that window often goes invisible."
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
  const [phase, setPhase]   = useState("intro");
  const [current, setCurrent] = useState("");
  const [n, setN]           = useState(0);
  const rowsRef = useRef([]);
  const [rows, setRows]     = useState([]);
  const timerRef = useRef(null);
  const TOTAL = 18;

  function begin() {
    rowsRef.current = [];
    setRows([]); setN(0); setCurrent("");
    setPhase("running");
    showNext(0);
  }

  function showNext(idx) {
    if (idx >= TOTAL) { setPhase("done"); return; }
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
      setTimeout(() => showNext(idx + 1), 200);
    }, 900);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const commissions = rows.filter(r => r.isNogo && r.pressed).length;
  const omissions   = rows.filter(r => !r.isNogo && !r.pressed).length;
  const accuracy    = rows.length ? Math.round((rows.length - commissions - omissions) / rows.length * 100) : 0;

  return (
    <GameShell
      cite="Robertson et al., 1997"
      instructions={<ol>
        <li>Digits appear one at a time, each shown for 900 ms.</li>
        <li>Press <span className="kbd">Space</span> for <strong>every digit except 3</strong>.</li>
        <li>When you see 3, hold back — do not press anything.</li>
        <li>18 digits total. Stay alert; 3 can appear any time.</li>
      </ol>}
      phase={phase} headline="don't press three"
      explain="A focus test — keeping a rule alive while resisting occasional impulses."
      onBegin={begin} onReset={begin}
      footer={`digit ${Math.min(n + 1, TOTAL)}/${TOTAL}`}
      results={[
        { label: "commissions", value: commissions },
        { label: "omissions",   value: omissions },
        { label: "accuracy",    value: `${accuracy}%` }
      ]}
      doneText="Pressing for 3 = impulsivity. Missing go digits = inattention. Both tell you something different about focus."
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
