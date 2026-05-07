{
const { GameShell, choice, mean, now, useEffect, useState } = window.GameKit;

function BlockFigure({ rot = 0, mirror = false }) {
  const pts = [[80, 70], [115, 70], [115, 105], [150, 105], [150, 140], [80, 140]];
  return (
    <svg viewBox="0 0 220 210" className="svg-stage" style={{ width: 220, height: 210, transform: `rotate(${rot}deg) scaleX(${mirror ? -1 : 1})` }}>
      {pts.map((p, i) => <rect key={i} x={p[0]} y={p[1]} width="34" height="34" fill={i % 2 ? "#dcefff" : "#9bd8f4"} stroke="#315a78"></rect>)}
    </svg>
  );
}

function MentalRotation() {
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [same, setSame] = useState(true);
  const [angle, setAngle] = useState(0);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);
  function next(n = 0) { setTrial(n); setSame(Math.random() > 0.35); setAngle(choice([0, 45, 90, 135, 180])); setStarted(now()); }
  function begin() { setRows([]); setPhase("running"); next(0); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (!["y", "n"].includes(k)) return;
      const ok = (k === "y") === same;
      const nextRows = [...rows, { ok, rt: now() - started, angle }];
      if (trial >= 11) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, same, started, rows, trial, angle]);
  return (
    <GameShell cite="Shepard & Metzler, 1971" instructions={
        <ol>
          <li>Two block figures appear side by side.</li>
          <li>Decide whether they are the <strong>same shape</strong> (just rotated) or <strong>mirror images</strong>.</li>
          <li>Press <span className="kbd">Y</span> for same · <span className="kbd">N</span> for different.</li>
          <li>12 trials — rotation angle varies from 0° to 180°.</li>
        </ol>
      } phase={phase} headline="turn it in mind" explain="Two assemblies appear. Decide whether rotation alone could make them match." onBegin={begin} onReset={begin} footer={`trial ${Math.min(trial + 1, 12)}/12 · angle ${angle}°`} results={[{ label: "accuracy", value: `${Math.round(rows.filter((r) => r.ok).length / Math.max(1, rows.length) * 100)}%` }, { label: "mean RT", value: `${mean(rows.map((r) => r.rt))} ms` }, { label: "largest angle", value: `${Math.max(0, ...rows.map((r) => r.angle))}°` }]} doneText="Mental rotation tends to slow as angular distance grows, as though the image is actually being turned.">
      <div className="choice-row">
        <BlockFigure rot={0} />
        <BlockFigure rot={angle} mirror={!same} />
      </div>
    </GameShell>
  );
}

Object.assign(window, { MentalRotation });
}
