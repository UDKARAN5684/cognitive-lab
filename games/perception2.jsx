{
const { GameShell, rand, useState } = window.GameKit;

/* ── Ponzo Illusion ─────────────────────────────────────────────────── */
function Ponzo() {
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [rows,  setRows]  = useState([]);
  const N = 8;

  function begin() { setRows([]); setTrial(0); setPhase("running"); }

  function pick(topLonger) {
    const nr = [...rows, { topLonger }];
    setRows(nr);
    if (trial >= N - 1) setPhase("done");
    else setTrial(trial + 1);
  }

  const topPicks = rows.filter(r => r.topLonger).length;

  return (
    <GameShell
      cite="Ponzo, 1911"
      instructions={<ol>
        <li>Two horizontal bars sit between converging lines.</li>
        <li>Judge which bar looks <strong>longer</strong> to you.</li>
        <li>Both bars are actually the same length — go with your gut.</li>
        <li>8 quick judgments total.</li>
      </ol>}
      phase={phase} headline="which is longer?"
      explain="Converging lines trick the brain into seeing equal things as different sizes."
      onBegin={begin} onReset={begin}
      footer={`judgment ${trial + 1}/${N}`}
      results={[
        { label: "chose top bar",    value: `${topPicks}/${N}` },
        { label: "chose bottom bar", value: `${N - topPicks}/${N}` },
        { label: "reality",          value: "both equal" }
      ]}
      doneText="The Ponzo illusion: the top bar looks longer because the brain applies the same size-distance logic it uses in the real world."
    >
      <div className="center-stack">
        <svg width="300" height="300" viewBox="0 0 300 300" style={{ maxWidth: "100%" }}>
          {/* converging railroad lines */}
          <line x1="150" y1="18"  x2="30"  y2="282" stroke="var(--text)" strokeWidth="2.5"/>
          <line x1="150" y1="18"  x2="270" y2="282" stroke="var(--text)" strokeWidth="2.5"/>
          {/* top bar — looks longer due to context */}
          <line x1="100" y1="88"  x2="200" y2="88"  stroke="#2563EB" strokeWidth="8" strokeLinecap="round"/>
          <text x="215" y="93" fontSize="12" fill="#2563EB" fontFamily="JetBrains Mono">A</text>
          {/* bottom bar — same physical length */}
          <line x1="72"  y1="208" x2="228" y2="208" stroke="#DC2626" strokeWidth="8" strokeLinecap="round"/>
          <text x="235" y="213" fontSize="12" fill="#DC2626" fontFamily="JetBrains Mono">B</text>
        </svg>
        <div className="choice-row">
          <button className="choice-btn" style={{ color: "#2563EB", borderColor: "#2563EB" }} onClick={() => pick(true)}>A (top) longer</button>
          <button className="choice-btn" onClick={() => pick(null)}>Looks equal</button>
          <button className="choice-btn" style={{ color: "#DC2626", borderColor: "#DC2626" }} onClick={() => pick(false)}>B (bottom) longer</button>
        </div>
      </div>
    </GameShell>
  );
}

/* ── Vertical-Horizontal Illusion ───────────────────────────────────── */
function VerticalHorizontal() {
  const N = 8;
  // pre-generate pairs so they don't change on re-render
  const [pairs] = useState(() =>
    Array.from({ length: N }, () => {
      const base = 90 + rand(0, 40);
      const diff = (Math.random() < 0.5 ? 1 : -1) * (12 + rand(0, 18));
      return { vert: base, horiz: base + diff, vertLonger: diff < 0 };
    })
  );
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [rows,  setRows]  = useState([]);

  function begin() { setRows([]); setTrial(0); setPhase("running"); }

  function pick(pickedVert) {
    const correct = pairs[trial].vertLonger === pickedVert;
    const nr = [...rows, { correct, pickedVert }];
    setRows(nr);
    if (trial >= N - 1) setPhase("done");
    else setTrial(trial + 1);
  }

  const score = rows.filter(r => r.correct).length;
  const vertPicks = rows.filter(r => r.pickedVert).length;

  const p = pairs[trial] || { vert: 100, horiz: 100 };

  return (
    <GameShell
      cite="Fick, 1851"
      instructions={<ol>
        <li>Two lines appear — one vertical (blue), one horizontal (red).</li>
        <li>Judge which line looks <strong>longer</strong>.</li>
        <li>Vertical lines consistently feel longer, even when they're not.</li>
        <li>8 pairs total — trust what you see.</li>
      </ol>}
      phase={phase} headline="up vs across"
      explain="Your brain stretches perceived height — vertical lines look longer than equal horizontal ones."
      onBegin={begin} onReset={begin}
      footer={`pair ${trial + 1}/${N}`}
      results={[
        { label: "correct",       value: `${score}/${N}` },
        { label: "chose vertical", value: vertPicks },
        { label: "illusion",      value: "vertical overestimation" }
      ]}
      doneText="The vertical-horizontal illusion: upward extent is systematically overestimated — a quirk baked into how the visual system represents space."
    >
      <div className="center-stack">
        <svg width="280" height="220" viewBox="0 0 280 220" style={{ maxWidth: "100%" }}>
          {/* vertical line (blue) */}
          <line x1="90" y1={110 - p.vert / 2} x2="90" y2={110 + p.vert / 2}
            stroke="#2563EB" strokeWidth="7" strokeLinecap="round"/>
          <text x="70" y={110 - p.vert / 2 - 8} fontSize="11" fill="#2563EB" fontFamily="JetBrains Mono">A</text>
          {/* horizontal line (red) */}
          <line x1={160} y1="145" x2={160 + p.horiz} y2="145"
            stroke="#DC2626" strokeWidth="7" strokeLinecap="round"/>
          <text x={160 + p.horiz + 8} y="149" fontSize="11" fill="#DC2626" fontFamily="JetBrains Mono">B</text>
        </svg>
        <div className="choice-row">
          <button className="choice-btn" style={{ color: "#2563EB" }} onClick={() => pick(true)}>A (vertical) longer</button>
          <button className="choice-btn" style={{ color: "#DC2626" }} onClick={() => pick(false)}>B (horizontal) longer</button>
        </div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { Ponzo, VerticalHorizontal });
}
