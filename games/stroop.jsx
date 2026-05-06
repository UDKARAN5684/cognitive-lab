{
const { GameShell, choice, mean, now, shuffle, useEffect, useState } = window.GameKit;

function Stroop() {
  const colors = [
    { word: "RED", key: "r", ink: "#9bd8f4" },
    { word: "BLUE", key: "b", ink: "#7fbce6" },
    { word: "GREEN", key: "g", ink: "#a9cfff" },
    { word: "YELLOW", key: "y", ink: "#c5deff" }
  ];
  const [phase, setPhase] = useState("intro");
  const [trials, setTrials] = useState([]);
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);

  function begin() {
    const made = shuffle(Array.from({ length: 24 }, (_, n) => {
      const ink = choice(colors);
      const word = n % 2 ? ink : choice(colors.filter((c) => c.key !== ink.key));
      return { word: word.word, ink: ink.ink, key: ink.key, congruent: word.key === ink.key };
    }));
    setTrials(made); setRows([]); setI(0); setStarted(now()); setPhase("running");
  }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (!["r", "b", "g", "y"].includes(k)) return;
      const t = trials[i];
      const next = [...rows, { rt: now() - started, ok: k === t.key, congruent: t.congruent }];
      if (i + 1 >= trials.length) { setRows(next); setPhase("done"); } else { setRows(next); setI(i + 1); setStarted(now()); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, i, started, rows, trials]);

  const con = rows.filter((r) => r.congruent && r.ok).map((r) => r.rt);
  const inc = rows.filter((r) => !r.congruent && r.ok).map((r) => r.rt);
  return (
    <GameShell
      cite="Stroop, 1935"
      instructions={<><span className="kbd">R</span><span className="kbd">B</span><span className="kbd">G</span><span className="kbd">Y</span> name the ink colour, not the word</>}
      phase={phase}
      headline="name the ink"
      explain="A fluent word arrives faster than you asked for. Let the ink win."
      onBegin={begin}
      onReset={begin}
      footer={`trial ${Math.min(i + 1, trials.length || 24)}/24 · accuracy ${rows.length ? Math.round(rows.filter((r) => r.ok).length / rows.length * 100) : 0}%`}
      results={[
        { label: "congruent", value: `${mean(con)} ms` },
        { label: "incongruent", value: `${mean(inc)} ms` },
        { label: "delta", value: `${Math.max(0, mean(inc) - mean(con))} ms` }
      ]}
      doneText="The classic effect is the extra time paid when word meaning and ink colour disagree."
    >
      <div className="center-stack">
        <div className="stimulus" style={{ color: trials[i]?.ink }}>{trials[i]?.word}</div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { Stroop });
}
