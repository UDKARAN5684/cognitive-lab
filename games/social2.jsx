{
const { GameShell, rand, useState } = window.GameKit;

/* ── Dictator Game ──────────────────────────────────────────────────── */
function DictatorGame() {
  const [phase, setPhase]   = useState("intro");
  const [amount, setAmount] = useState(5);
  const [rounds, setRounds] = useState([]);
  const N = 5;

  function begin() { setRounds([]); setAmount(5); setPhase("running"); }

  function give() {
    const nr = [...rounds, { given: amount, kept: 10 - amount }];
    setRounds(nr);
    setAmount(5);
    if (nr.length >= N) setPhase("done");
  }

  const avgGiven = rounds.length ? Math.round(rounds.reduce((s, r) => s + r.given, 0) / rounds.length) : 0;

  return (
    <GameShell
      cite="Kahneman et al., 1986"
      instructions={<ol>
        <li>You receive $10 to split between yourself and an anonymous stranger.</li>
        <li>The stranger <strong>cannot reject</strong> your offer — whatever you give, they keep.</li>
        <li>Drag the slider to choose how much to give. You keep the rest.</li>
        <li>5 rounds, 5 different strangers.</li>
      </ol>}
      phase={phase} headline="how generous are you?"
      explain="Unlike the Ultimatum Game, the stranger can't reject. So any giving is pure altruism."
      onBegin={begin} onReset={begin}
      footer={`round ${rounds.length + 1}/${N}`}
      results={[
        { label: "avg given",  value: `$${avgGiven}` },
        { label: "avg kept",   value: `$${10 - avgGiven}` },
        { label: "generosity", value: avgGiven >= 5 ? "very generous" : avgGiven >= 3 ? "moderate" : "self-interested" }
      ]}
      doneText="Most people give 20–30% even when rejection is impossible. It suggests altruism is real — even toward strangers who can't punish us."
    >
      <div className="center-stack">
        <p className="task-explain">Round {rounds.length + 1} — You have <strong>$10</strong>. Slide to decide.</p>
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--blue)" }}>
          Give <span style={{ color: "#2563EB" }}>${amount}</span> · Keep <span style={{ color: "#059669" }}>${10 - amount}</span>
        </div>
        <div className="range-wrap" style={{ width: "min(320px, 90%)" }}>
          <input type="range" min="0" max="10" value={amount} onChange={e => setAmount(+e.target.value)} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <span>$0 (keep all)</span><span>$5 (split)</span><span>$10 (give all)</span>
          </div>
        </div>
        <button className="primary-btn" onClick={give}>Confirm →</button>
      </div>
    </GameShell>
  );
}

/* ── Spotlight Effect ───────────────────────────────────────────────── */
function SpotlightEffect() {
  const scenarios = [
    { event: "You spilled coffee on your shirt before a meeting.",        q: "How many of the 20 colleagues present noticed?",          actual: 3,  max: 20 },
    { event: "You mispronounced a word clearly while presenting.",        q: "How many of the 30 listeners caught the mistake?",         actual: 5,  max: 30 },
    { event: "You arrived 5 minutes late to a dinner party of 8.",        q: "How many guests were noticeably bothered?",                actual: 2,  max: 8  },
    { event: "You laughed at the wrong moment in a group conversation.",  q: "How many of the 6 people were bothered by it?",           actual: 1,  max: 6  },
    { event: "You wore the same outfit two days running at work.",        q: "How many of your 15 co-workers noticed?",                 actual: 2,  max: 15 },
  ];

  const [phase, setPhase] = useState("intro");
  const [idx,   setIdx]   = useState(0);
  const [est,   setEst]   = useState(10);
  const [rows,  setRows]  = useState([]);

  function begin() { setIdx(0); setEst(10); setRows([]); setPhase("running"); }

  function submit() {
    const { actual } = scenarios[idx];
    const nr = [...rows, { estimate: est, actual }];
    setRows(nr);
    setEst(Math.floor(scenarios[Math.min(idx + 1, scenarios.length - 1)].max / 2));
    if (idx >= scenarios.length - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const avgEst    = rows.length ? Math.round(rows.reduce((s, r) => s + r.estimate, 0) / rows.length) : 0;
  const avgActual = rows.length ? Math.round(rows.reduce((s, r) => s + r.actual,   0) / rows.length) : 0;

  return (
    <GameShell
      cite="Gilovich et al., 2000"
      instructions={<ol>
        <li>Five everyday slip-ups are described.</li>
        <li>Estimate how many people <strong>actually noticed</strong> each one.</li>
        <li>Drag the slider to your best guess, then submit.</li>
        <li>We'll compare your estimates to what research shows.</li>
      </ol>}
      phase={phase} headline="who actually noticed?"
      explain="We feel like we're under a spotlight — but others are far too busy thinking about themselves."
      onBegin={begin} onReset={begin}
      footer={`scenario ${idx + 1}/${scenarios.length}`}
      results={[
        { label: "your avg estimate", value: avgEst },
        { label: "research avg",      value: avgActual },
        { label: "spotlight bias",    value: avgEst > avgActual + 2 ? "strong" : avgEst > avgActual ? "present" : "low" }
      ]}
      doneText="The spotlight effect: we're the star of our own movie, so our mistakes loom large. For everyone else, we're a background extra."
    >
      <div className="center-stack">
        <p className="task-explain">{scenarios[idx]?.event}</p>
        <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>{scenarios[idx]?.q}</p>
        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--blue)" }}>{est} people</div>
        <div className="range-wrap" style={{ width: "min(320px, 90%)" }}>
          <input type="range" min="0" max={scenarios[idx]?.max || 20} value={est}
            onChange={e => setEst(+e.target.value)} />
        </div>
        <button className="primary-btn" onClick={submit}>Submit →</button>
      </div>
    </GameShell>
  );
}

Object.assign(window, { DictatorGame, SpotlightEffect });
}
