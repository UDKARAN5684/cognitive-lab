{
const { GameShell, choice, mean, rand, now, shuffle, useEffect, useState } = window.GameKit;

function Flanker() {
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [stim, setStim] = useState(null);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);
  function make() {
    const dir = choice(["<", ">"]);
    const congruent = Math.random() < 0.5;
    const flank = congruent ? dir : dir === "<" ? ">" : "<";
    return { text: `${flank}${flank}${dir}${flank}${flank}`, key: dir === "<" ? "ArrowLeft" : "ArrowRight", congruent };
  }
  function next(n = 0) { setTrial(n); setStim(make()); setStarted(now()); }
  function begin() { setRows([]); setPhase("running"); next(0); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const nextRows = [...rows, { ok: e.key === stim.key, rt: now() - started, congruent: stim.congruent }];
      if (trial >= 23) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, stim, started, rows, trial]);
  const con = rows.filter((r) => r.ok && r.congruent).map((r) => r.rt);
  const inc = rows.filter((r) => r.ok && !r.congruent).map((r) => r.rt);
  return (
    <GameShell cite="Eriksen & Eriksen, 1974" instructions={
        <ol>
          <li>A row of five arrows appears — the <strong>centre arrow is all that matters</strong>.</li>
          <li>Press <span className="kbd">←</span> if the centre arrow points left.</li>
          <li>Press <span className="kbd">→</span> if the centre arrow points right.</li>
          <li>Ignore the flanking arrows — 24 trials total.</li>
        </ol>
      } phase={phase} headline="ignore the chorus" explain="The middle arrow is the only one that counts. The flanks will try to vote." onBegin={begin} onReset={begin} footer={`trial ${Math.min(trial + 1, 24)}/24`} results={[{ label: "congruent", value: `${mean(con)} ms` }, { label: "incongruent", value: `${mean(inc)} ms` }, { label: "cost", value: `${Math.max(0, mean(inc) - mean(con))} ms` }]} doneText="A flanker cost means irrelevant arrows still entered the response system.">
      <div className="mono-big">{stim?.text}</div>
    </GameShell>
  );
}

function VisualSearch() {
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [items, setItems] = useState([]);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);
  function make(n) {
    const setSize = [12, 20, 32][n % 3];
    const targetAt = rand(0, setSize - 1);
    return Array.from({ length: setSize }, (_, i) => {
      if (i === targetAt) return { target: true, circle: false, red: true };
      const redCircle = Math.random() > 0.5;
      return { target: false, circle: redCircle, red: redCircle };
    });
  }
  function next(n = 0) { setTrial(n); setItems(shuffle(make(n))); setStarted(now()); }
  function begin() { setRows([]); setPhase("running"); next(0); }
  function pick(item) {
    if (!item.target) return;
    const nextRows = [...rows, { rt: now() - started, size: items.length }];
    if (trial >= 8) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); }
  }
  return (
    <GameShell cite="Treisman & Gelade, 1980" instructions={
        <ol>
          <li>A grid of shapes appears — red or green, circles or squares.</li>
          <li>Find the <strong>red square</strong> (there is exactly one).</li>
          <li><strong>Click it</strong> as quickly as you can.</li>
          <li>9 trials — the number of distractors grows each time.</li>
        </ol>
      } phase={phase} headline="find the conjunction" explain="A target defined by colour and shape asks for serial attention." onBegin={begin} onReset={begin} footer={`trial ${Math.min(trial + 1, 9)}/9 · set size ${items.length || 12}`} results={[{ label: "mean search", value: `${mean(rows.map((r) => r.rt))} ms` }, { label: "small sets", value: `${mean(rows.filter((r) => r.size === 12).map((r) => r.rt))} ms` }, { label: "large sets", value: `${mean(rows.filter((r) => r.size === 32).map((r) => r.rt))} ms` }]} doneText="Conjunction search usually slows as more distractors join the display.">
      <div className="shape-grid">
        {items.map((it, i) => <button key={i} className={`shape ${it.circle ? "circle" : ""} ${it.red ? "red" : "green"}`} onClick={() => pick(it)} aria-label="shape"></button>)}
      </div>
    </GameShell>
  );
}

Object.assign(window, { Flanker, VisualSearch });
}
