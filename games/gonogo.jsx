{
const { GameShell, choice, mean, now, useEffect, useState } = window.GameKit;

function GoNoGo() {
  const [phase, setPhase] = useState("intro");
  const [letters, setLetters] = useState([]);
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);
  function begin() {
    const s = Array.from({ length: 30 }, () => Math.random() < 0.25 ? "X" : choice("ABCDEFGHJKLMNPQRSTUVWYZ".split("")));
    setLetters(s); setRows([]); setI(0); setStarted(now()); setPhase("running");
  }
  function advance(nextRows) {
    if (i >= letters.length - 1) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); setI(i + 1); setStarted(now()); }
  }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const timeout = setTimeout(() => {
      const l = letters[i];
      advance([...rows, { kind: l === "X" ? "correctReject" : "miss", rt: 0 }]);
    }, 900);
    const onKey = (e) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      const l = letters[i];
      advance([...rows, { kind: l === "X" ? "commission" : "hit", rt: now() - started }]);
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(timeout); window.removeEventListener("keydown", onKey); };
  }, [phase, i, letters, rows, started]);
  const hits = rows.filter((r) => r.kind === "hit");
  return (
    <GameShell cite="Donders lineage, 1868" instructions={
        <ol>
          <li>Letters appear one at a time on screen.</li>
          <li>Press <span className="kbd">Space</span> for every letter <strong>except X</strong>.</li>
          <li>When X appears, do nothing — hold your response.</li>
          <li>Speed and restraint both count — 30 trials total.</li>
        </ol>
      } phase={phase} headline="go, until no-go" explain="Most letters ask for a response. X asks for a tiny act of stopping." onBegin={begin} onReset={begin} footer={`trial ${Math.min(i + 1, letters.length || 30)}/30`} results={[{ label: "mean go RT", value: `${mean(hits.map((r) => r.rt))} ms` }, { label: "commissions", value: rows.filter((r) => r.kind === "commission").length }, { label: "misses", value: rows.filter((r) => r.kind === "miss").length }]} doneText="Commission errors are responses made when restraint was the whole task.">
      <div className="mono-big">{letters[i]}</div>
    </GameShell>
  );
}

Object.assign(window, { GoNoGo });
}
