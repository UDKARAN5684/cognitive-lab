{
const { GameShell, choice, mean, rand, now, useEffect, useState } = window.GameKit;

function PosnerCueing() {
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [cue, setCue] = useState("left");
  const [target, setTarget] = useState("");
  const [showTarget, setShowTarget] = useState(false);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);

  function next(n = 0) {
    const c = choice(["left", "right"]);
    const valid = Math.random() < 0.8;
    const t = valid ? c : c === "left" ? "right" : "left";
    setTrial(n); setCue(c); setTarget(t); setShowTarget(false);
    setTimeout(() => { setShowTarget(true); setStarted(now()); }, rand(100, 300));
  }
  function begin() { setRows([]); setPhase("running"); next(0); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      if (e.code !== "Space" || !showTarget) return;
      e.preventDefault();
      const nextRows = [...rows, { rt: now() - started, valid: cue === target }];
      if (trial >= 19) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, showTarget, started, rows, trial, cue, target]);
  const valid = rows.filter((r) => r.valid).map((r) => r.rt);
  const invalid = rows.filter((r) => !r.valid).map((r) => r.rt);
  return (
    <GameShell cite="Posner, 1980" instructions={<><span className="kbd">Space</span> press when the dot appears</>} phase={phase} headline="covert spotlight" explain="Let the arrow tug attention left or right, then respond to the target dot." onBegin={begin} onReset={begin} footer={`trial ${Math.min(trial + 1, 20)}/20 · cue ${cue}`} results={[{ label: "valid", value: `${mean(valid)} ms` }, { label: "invalid", value: `${mean(invalid)} ms` }, { label: "cue cost", value: `${Math.max(0, mean(invalid) - mean(valid))} ms` }]} doneText="Valid cues usually help; invalid cues charge a small reorienting toll.">
      <div className="center-stack">
        <div className="choice-row" style={{ width: "520px", alignItems: "center" }}>
          <div className="sort-card">{showTarget && target === "left" ? "●" : ""}</div>
          <div className="mono-big">{cue === "left" ? "←" : "→"}</div>
          <div className="sort-card">{showTarget && target === "right" ? "●" : ""}</div>
        </div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { PosnerCueing });
}
