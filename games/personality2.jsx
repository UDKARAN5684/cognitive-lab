{
const { GameShell, mean, useState } = window.GameKit;

/* ── Locus of Control ───────────────────────────────────────────────── */
function LocusControl() {
  // Each pair: [external statement, internal statement]
  // flipped[] controls display order to avoid response bias
  const pairs = [
    ["What happens to me is mostly determined by chance.", "What happens to me is mostly my own doing."],
    ["Getting a good job depends on being in the right place at the right time.", "Becoming successful is a matter of hard work — luck has little to do with it."],
    ["Many times I feel I have little influence over what happens to me.", "It is impossible for me to believe that chance plays an important role in my life."],
    ["People are lonely because they don't try to be friendly.", "There's not much use trying hard to please people — if they like you, they like you."],
    ["I have often found that what is going to happen will happen.", "Trusting to fate has never turned out as well for me as making a concrete decision."],
    ["Most misfortunes are the result of bad luck.", "Most misfortunes are the result of lack of effort or poor decisions."],
  ];
  const flipped = [false, true, false, true, false, true];

  const [phase, setPhase] = useState("intro");
  const [idx,   setIdx]   = useState(0);
  const [scores, setScores] = useState([]); // 1 = internal, 0 = external

  function begin() { setIdx(0); setScores([]); setPhase("running"); }

  function pick(choseFirst) {
    // First option = external when not flipped, internal when flipped
    const isInternal = flipped[idx] ? choseFirst : !choseFirst;
    const nr = [...scores, isInternal ? 1 : 0];
    setScores(nr);
    if (idx >= pairs.length - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const internalScore = scores.reduce((s, v) => s + v, 0);
  const externalScore = scores.length - internalScore;

  // Display order based on flip
  const optA = flipped[idx] ? pairs[idx][1] : pairs[idx][0];
  const optB = flipped[idx] ? pairs[idx][0] : pairs[idx][1];

  return (
    <GameShell
      cite="Rotter, 1966"
      instructions={<ol>
        <li>Six pairs of statements appear one at a time.</li>
        <li>Choose the one that <strong>better describes how you see the world</strong>.</li>
        <li>There are no right or wrong answers — go with your first instinct.</li>
        <li>This measures whether you feel in control of your own life.</li>
      </ol>}
      phase={phase} headline="who's in control?"
      explain="Do events happen to you, or do you make things happen?"
      onBegin={begin} onReset={begin}
      footer={`pair ${idx + 1}/${pairs.length}`}
      results={[
        { label: "internal locus", value: internalScore },
        { label: "external locus", value: externalScore },
        { label: "orientation",    value: internalScore > externalScore ? "internal" : internalScore === externalScore ? "balanced" : "external" }
      ]}
      doneText="Internal: 'I shape my outcomes.' External: 'things happen to me.' Neither is always better — context matters enormously."
    >
      <div className="center-stack">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "min(480px,100%)" }}>
          <button className="choice-btn" style={{ textAlign: "left", padding: "16px 18px", lineHeight: 1.5 }} onClick={() => pick(true)}>
            {optA}
          </button>
          <button className="choice-btn" style={{ textAlign: "left", padding: "16px 18px", lineHeight: 1.5 }} onClick={() => pick(false)}>
            {optB}
          </button>
        </div>
      </div>
    </GameShell>
  );
}

/* ── Need for Cognition ─────────────────────────────────────────────── */
function NeedForCognition() {
  const items = [
    ["I would prefer complex to simple problems.",                                                     1],
    ["I like having the responsibility of handling a situation that requires a lot of thinking.",       1],
    ["Thinking is not my idea of fun.",                                                               -1],
    ["I would rather do something requiring little thought than something that challenges my mind.",   -1],
    ["I try to avoid situations where I might have to think hard.",                                   -1],
    ["I find satisfaction in deliberating hard and for long hours.",                                   1],
    ["I only think as hard as I have to.",                                                            -1],
    ["I prefer to think about small daily projects than long-term ones.",                             -1],
  ];

  const [phase, setPhase] = useState("intro");
  const [idx,   setIdx]   = useState(0);
  const [scores, setScores] = useState([]);

  function begin() { setIdx(0); setScores([]); setPhase("running"); }

  function rate(v) {
    const [, dir] = items[idx];
    const val = dir > 0 ? v : 6 - v;
    const nr  = [...scores, val];
    setScores(nr);
    if (idx >= items.length - 1) setPhase("done");
    else setIdx(idx + 1);
  }

  const avg = scores.length ? (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1) : 0;

  return (
    <GameShell
      cite="Cacioppo & Petty, 1982"
      instructions={<ol>
        <li>Eight statements about thinking and problem-solving appear one at a time.</li>
        <li>Rate how well each describes you: <strong>1 = disagree</strong> to <strong>5 = agree</strong>.</li>
        <li>Answer honestly — this measures enjoyment of thinking, not intelligence.</li>
        <li>There are no right or wrong scores.</li>
      </ol>}
      phase={phase} headline="do you enjoy thinking?"
      explain="Need for Cognition measures how much you seek out and enjoy effortful thought."
      onBegin={begin} onReset={begin}
      footer={`item ${idx + 1}/${items.length}`}
      results={[
        { label: "NFC score", value: avg },
        { label: "scale",     value: "1–5" },
        { label: "tendency",  value: +avg >= 3.5 ? "high NFC" : +avg >= 2.5 ? "moderate" : "low NFC" }
      ]}
      doneText="High NFC people actively seek complexity and deliberate carefully. Low NFC people prefer efficient shortcuts — neither style is better in every situation."
    >
      <div className="center-stack">
        <p className="task-explain" style={{ fontStyle: "italic" }}>{items[idx]?.[0]}</p>
        <div className="choice-row">
          {[1, 2, 3, 4, 5].map(v => (
            <button key={v} className="choice-btn" style={{ minWidth: 52, fontSize: 18, fontWeight: 700 }} onClick={() => rate(v)}>{v}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          1 = strongly disagree · 5 = strongly agree
        </div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { LocusControl, NeedForCognition });
}
