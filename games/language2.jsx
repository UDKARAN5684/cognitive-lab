{
const { GameShell, shuffle, useEffect, useRef, useState } = window.GameKit;

/* ── Semantic Fluency ───────────────────────────────────────────────── */
function SemanticFluency() {
  const [phase, setPhase]   = useState("intro");
  const [input, setInput]   = useState("");
  const [words, setWords]   = useState([]);
  const [timeLeft, setTime] = useState(60);
  const [done, setDone]     = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  function begin() {
    setWords([]); setInput(""); setTime(60); setDone(false);
    setPhase("running");
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  useEffect(() => {
    if (done) setPhase("done");
  }, [done]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function addWord(e) {
    e.preventDefault();
    const w = input.trim().toLowerCase();
    if (!w || words.includes(w)) { setInput(""); return; }
    setWords(ws => [...ws, w]);
    setInput("");
  }

  const count     = words.length;
  const isGood    = count >= 20;
  const unique    = new Set(words).size;

  return (
    <GameShell
      cite="Benton & Hamsher, 1976"
      instructions={<ol>
        <li>Name as many <strong>animals</strong> as you can in <strong>60 seconds</strong>.</li>
        <li>Type each animal and press Enter (or tap Add).</li>
        <li>Any animal counts — pets, wild, prehistoric, mythical.</li>
        <li>Duplicates are ignored automatically.</li>
      </ol>}
      phase={phase} headline="name every animal you can"
      explain="How fast your brain retrieves words from a category reveals a lot about memory organization."
      onBegin={begin} onReset={begin}
      footer={phase === "running" ? `${timeLeft}s left · ${count} animals so far` : `finished`}
      results={[
        { label: "animals named",  value: count },
        { label: "unique words",   value: unique },
        { label: "verbal fluency", value: count >= 22 ? "excellent" : count >= 16 ? "typical" : "below avg" }
      ]}
      doneText="Average adults name 16–22 animals in 60 s. Scores below 14 can flag executive or semantic memory difficulties — but stress, fatigue and language affect results too."
    >
      <div className="center-stack">
        <div style={{ fontSize: 48, fontWeight: 900, color: timeLeft <= 10 ? "#DC2626" : "var(--blue)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}>
          {timeLeft}s
        </div>
        <form onSubmit={addWord} style={{ display: "flex", gap: 8, width: "min(360px,90%)" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="type an animal…"
            disabled={done}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "2px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
          />
          <button type="submit" className="primary-btn" disabled={done} style={{ whiteSpace: "nowrap" }}>Add →</button>
        </form>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "min(480px,90%)", justifyContent: "center", maxHeight: 160, overflowY: "auto" }}>
          {words.map((w, i) => (
            <span key={i} className="pill" style={{ fontSize: 13, padding: "4px 10px", background: "var(--blue-light)", color: "var(--blue)", border: "none" }}>{w}</span>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

/* ── Word Frequency Effect ──────────────────────────────────────────── */
function WordFrequency() {
  // pairs: [high-freq word, low-freq word] — always two real words
  const pairs = shuffle([
    ["table",    "clavicle"],
    ["happy",    "sanguine"],
    ["money",    "lucre"],
    ["fast",     "alacritous"],
    ["strong",   "puissant"],
    ["clear",    "pellucid"],
    ["tired",    "somnolent"],
    ["kind",     "benevolent"],
    ["secret",   "arcane"],
    ["bright",   "refulgent"],
    ["walk",     "perambulate"],
    ["fear",     "trepidation"],
  ]);

  const [phase, setPhase]   = useState("intro");
  const [idx, setIdx]       = useState(0);
  const [rows, setRows]     = useState([]);
  const [startMs, setStart] = useState(0);
  const [flipped] = useState(() => pairs.map(() => Math.random() < 0.5));

  function begin() { setIdx(0); setRows([]); setPhase("running"); setStart(Date.now()); }

  function pick(choseFirst) {
    const rt    = Date.now() - startMs;
    const pair  = pairs[idx];
    const isFlipped = flipped[idx];
    // First option is high-freq when not flipped
    const choseHigh = isFlipped ? !choseFirst : choseFirst;
    const nr = [...rows, { rt, choseHigh }];
    setRows(nr);
    setStart(Date.now());
    if (idx >= pairs.length - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const avgRT   = rows.length ? Math.round(rows.reduce((s, r) => s + r.rt, 0) / rows.length) : 0;
  const highPct = rows.length ? Math.round(rows.filter(r => r.choseHigh).length / rows.length * 100) : 0;

  const pair  = pairs[idx] || ["table", "clavicle"];
  const isFlipped = flipped[idx];
  const optA = isFlipped ? pair[1] : pair[0];
  const optB = isFlipped ? pair[0] : pair[1];

  return (
    <GameShell
      cite="Brysbaert et al., 2009"
      instructions={<ol>
        <li>Two words appear side by side.</li>
        <li>Pick the word that feels <strong>more familiar</strong> or more commonly used.</li>
        <li>Go with your gut — react quickly.</li>
        <li>Both words are real; one is just far rarer.</li>
      </ol>}
      phase={phase} headline="which word is more familiar?"
      explain="Common words are processed faster and feel more 'real' — even when you know both meanings."
      onBegin={begin} onReset={begin}
      footer={`word pair ${idx + 1}/${pairs.length}`}
      results={[
        { label: "avg reaction time", value: `${avgRT} ms` },
        { label: "chose common word", value: `${highPct}%` },
        { label: "frequency sense",   value: highPct >= 75 ? "strong" : highPct >= 50 ? "typical" : "low" }
      ]}
      doneText="High-frequency words activate faster in memory. This is why rare words feel 'harder' even when you technically know them — frequency shapes fluency."
    >
      <div className="center-stack">
        <p className="task-explain" style={{ color: "var(--text-3)", fontSize: 13 }}>Which feels more everyday?</p>
        <div style={{ display: "flex", gap: 16, width: "min(480px,90%)" }}>
          <button className="choice-btn" style={{ flex: 1, fontSize: 20, fontWeight: 700, padding: "20px 12px" }} onClick={() => pick(true)}>{optA}</button>
          <button className="choice-btn" style={{ flex: 1, fontSize: 20, fontWeight: 700, padding: "20px 12px" }} onClick={() => pick(false)}>{optB}</button>
        </div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { SemanticFluency, WordFrequency });
}
