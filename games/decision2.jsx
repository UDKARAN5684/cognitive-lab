{
const { GameShell, choice, mean, rand, shuffle, useState } = window.GameKit;

/* ── Gambler's Fallacy ──────────────────────────────────────────────── */
function GamblersFallacy() {
  const [phase, setPhase] = useState("intro");
  const [seqs,  setSeqs]  = useState([]);
  const [idx,   setIdx]   = useState(0);
  const [rows,  setRows]  = useState([]);
  const N = 8;

  function makeSeqs() {
    return Array.from({ length: N }, () => {
      const streak = rand(3, 5);
      const face   = Math.random() < 0.5 ? "H" : "T";
      const actual = Math.random() < 0.5 ? "H" : "T";
      return { history: Array(streak).fill(face), actual };
    });
  }

  function begin() { const s = makeSeqs(); setSeqs(s); setRows([]); setIdx(0); setPhase("running"); }

  function pick(guess) {
    const seq = seqs[idx];
    const predicted_opposite = guess !== seq.history[0];
    const nr = [...rows, { guess, actual: seq.actual, correct: guess === seq.actual, predictedOpposite: predicted_opposite }];
    setRows(nr);
    if (idx >= N - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const fallacyCount = rows.filter(r => r.predictedOpposite).length;
  const correct      = rows.filter(r => r.correct).length;
  const seq = seqs[idx] || { history: ["H","H","H"], actual: "H" };

  return (
    <GameShell
      cite="Tversky & Kahneman, 1971"
      instructions={<ol>
        <li>You'll see a sequence of fair coin flips (H = heads, T = tails).</li>
        <li>Predict what the <strong>very next flip</strong> will be.</li>
        <li>This is a perfectly fair coin — it has no memory of past flips.</li>
        <li>8 predictions total.</li>
      </ol>}
      phase={phase} headline="predict the flip"
      explain="After 5 heads in a row, tails doesn't become 'due'. Every flip is 50/50."
      onBegin={begin} onReset={begin}
      footer={`flip ${idx + 1}/${N}`}
      results={[
        { label: "predicted opposite", value: `${fallacyCount}/${N}` },
        { label: "correct guesses",    value: `${correct}/${N}` },
        { label: "fallacy present",    value: fallacyCount >= 5 ? "yes" : "minimal" }
      ]}
      doneText="The gambler's fallacy: thinking a streak makes the other result 'overdue'. Fair coins have no memory — each flip is always 50/50."
    >
      <div className="center-stack">
        <div className="pill-row">
          {seq.history.map((f, i) => (
            <span key={i} className="pill" style={{ fontSize: 22, fontWeight: 800, padding: "10px 16px" }}>{f}</span>
          ))}
          <span className="pill" style={{ fontSize: 22, color: "var(--text-4)", padding: "10px 16px" }}>?</span>
        </div>
        <p className="task-explain">
          After <strong>{seq.history.length} {seq.history[0] === "H" ? "heads" : "tails"}</strong> in a row, what's next?
        </p>
        <div className="choice-row">
          <button className="choice-btn" onClick={() => pick("H")}>Heads (H)</button>
          <button className="choice-btn" onClick={() => pick("T")}>Tails (T)</button>
        </div>
      </div>
    </GameShell>
  );
}

/* ── Overconfidence Calibration ─────────────────────────────────────── */
function Overconfidence() {
  const qs = [
    ["What is the capital of Australia?",              "Canberra",    ["Sydney","Melbourne","Canberra","Brisbane"]],
    ["How many bones are in an adult human body?",     "206",         ["186","206","226","256"]],
    ["In what year did the Berlin Wall fall?",         "1989",        ["1985","1987","1989","1991"]],
    ["Which ocean is the largest?",                   "Pacific",     ["Atlantic","Indian","Pacific","Arctic"]],
    ["Who painted the Sistine Chapel ceiling?",       "Michelangelo",["Leonardo","Raphael","Michelangelo","Botticelli"]],
    ["What gas do plants absorb from the air?",       "CO₂",         ["O₂","N₂","CO₂","H₂"]],
    ["Which planet is closest to the Sun?",           "Mercury",     ["Venus","Mercury","Mars","Earth"]],
    ["How many sides does a hexagon have?",           "6",           ["5","6","7","8"]],
  ];

  const [phase, setPhase]   = useState("intro");
  const [idx,   setIdx]     = useState(0);
  const [ans,   setAns]     = useState("");
  const [conf,  setConf]    = useState(70);
  const [rows,  setRows]    = useState([]);

  function begin() { setIdx(0); setAns(""); setConf(70); setRows([]); setPhase("running"); }

  function submit() {
    if (!ans) return;
    const [, correct] = qs[idx];
    const nr = [...rows, { ans, conf, correct: ans === correct }];
    setRows(nr); setAns(""); setConf(70);
    if (idx >= qs.length - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const avgConf   = rows.length ? Math.round(mean(rows.map(r => r.conf)))   : 0;
  const actualPct = rows.length ? Math.round(rows.filter(r => r.correct).length / rows.length * 100) : 0;
  const score     = rows.filter(r => r.correct).length;

  return (
    <GameShell
      cite="Fischhoff et al., 1977"
      instructions={<ol>
        <li>Answer 8 multiple-choice trivia questions.</li>
        <li>After each answer, rate your <strong>confidence</strong> from 50% (pure guess) to 100% (certain).</li>
        <li>At the end, we compare your confidence to your actual score.</li>
        <li>Well-calibrated thinkers match the two — most people don't.</li>
      </ol>}
      phase={phase} headline="how sure are you?"
      explain="Most people's confidence is higher than their accuracy. Can you beat the bias?"
      onBegin={begin} onReset={begin}
      footer={`question ${idx + 1}/${qs.length}`}
      results={[
        { label: "score",            value: `${score}/${qs.length}` },
        { label: "avg confidence",   value: `${avgConf}%` },
        { label: "actual accuracy",  value: `${actualPct}%` }
      ]}
      doneText="Overconfidence: your stated certainty exceeds your actual hit rate. The gap between the two numbers is the bias."
    >
      <div className="center-stack">
        <p className="task-explain" style={{ fontWeight: 600, fontSize: 17 }}>{qs[idx]?.[0]}</p>
        <div className="choice-row" style={{ flexWrap: "wrap" }}>
          {qs[idx]?.[2].map(opt => (
            <button
              key={opt}
              className="choice-btn"
              style={ans === opt ? { borderColor: "var(--blue)", background: "var(--blue-light)", color: "var(--blue)" } : {}}
              onClick={() => setAns(opt)}
            >{opt}</button>
          ))}
        </div>
        {ans && (
          <div className="range-wrap" style={{ width: "min(340px,90%)", marginTop: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Confidence: <strong>{conf}%</strong></span>
            <input type="range" min="50" max="100" step="5" value={conf} onChange={e => setConf(+e.target.value)} />
            <button className="primary-btn" onClick={submit} style={{ marginTop: 8, width: "100%" }}>Submit →</button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

/* ── Sunk Cost Fallacy ──────────────────────────────────────────────── */
function SunkCost() {
  const scenarios = [
    { setup: "You bought an $80 concert ticket. The night arrives — you feel sick and it's raining hard. The ticket is non-refundable.", q: "Do you go anyway?", rational: "No — the $80 is already gone either way." },
    { setup: "Your company has spent $2 million developing a product. New data shows it won't succeed. Stopping saves $500K.", q: "Do you continue the project?", rational: "No — future losses matter more than past spending." },
    { setup: "You've been watching a movie for 45 minutes and it's terrible. You have a free evening with no other plans.", q: "Do you keep watching?", rational: "No — an hour of boredom is worse than admitting a mistake." },
    { setup: "You're in a long queue and have waited 20 minutes. The line is barely moving and you can't see the front.", q: "Do you keep waiting?", rational: "Depends — but the 20 min already spent shouldn't be the reason." },
    { setup: "You ordered a meal that turned out to be unpleasant. You're not hungry anymore but there's a lot left.", q: "Do you keep eating?", rational: "No — your discomfort costs more than the wasted food." },
  ];

  const [phase, setPhase] = useState("intro");
  const [idx,   setIdx]   = useState(0);
  const [rows,  setRows]  = useState([]);

  function begin() { setIdx(0); setRows([]); setPhase("running"); }

  function pick(yes) {
    const nr = [...rows, { yes }];
    setRows(nr);
    if (idx >= scenarios.length - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const yesCount = rows.filter(r => r.yes).length;

  return (
    <GameShell
      cite="Arkes & Blumer, 1985"
      instructions={<ol>
        <li>Five real-life scenarios describe money or time already spent.</li>
        <li>Decide what you would <strong>actually</strong> do.</li>
        <li>Rationally, past costs shouldn't drive future decisions — but they do.</li>
        <li>Answer honestly — your gut response is the interesting data.</li>
      </ol>}
      phase={phase} headline="cut your losses?"
      explain="Money already spent shouldn't affect what you do next — but it usually does."
      onBegin={begin} onReset={begin}
      footer={`scenario ${idx + 1}/${scenarios.length}`}
      results={[
        { label: "stayed (sunk cost)",  value: yesCount },
        { label: "cut losses",          value: scenarios.length - yesCount },
        { label: "sunk cost pull",      value: yesCount >= 4 ? "very strong" : yesCount >= 3 ? "strong" : yesCount >= 2 ? "moderate" : "weak" }
      ]}
      doneText="Sunk costs are gone regardless of what you do next. But emotionally, throwing good money after bad is one of the hardest traps to escape."
    >
      <div className="center-stack">
        <p className="task-explain">{scenarios[idx]?.setup}</p>
        <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>{scenarios[idx]?.q}</p>
        <div className="choice-row">
          <button className="choice-btn" onClick={() => pick(true)}>Yes</button>
          <button className="choice-btn" onClick={() => pick(false)}>No</button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace" }}>
          Rational answer: {scenarios[idx]?.rational}
        </p>
      </div>
    </GameShell>
  );
}

Object.assign(window, { GamblersFallacy, Overconfidence, SunkCost });
}
