{
const { GameShell, choice, mean, rand, now, useEffect, useState } = window.GameKit;

function TaskSwitch() {
  const colors = ["red", "blue"], shapes = ["●", "■"];
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [cue, setCue] = useState("color"), [stim, setStim] = useState(null), [started, setStarted] = useState(0), [rows, setRows] = useState([]);
  function next(n = 0, prev = cue) { const c = Math.random() < 0.5 ? prev : (prev === "color" ? "shape" : "color"); setTrial(n); setCue(c); setStim({ color: choice(colors), shape: choice(shapes), prev }); setStarted(now()); }
  function begin() { setRows([]); setPhase("running"); next(0, "shape"); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const correct = cue === "color" ? stim.color[0] : (stim.shape === "●" ? "c" : "s");
      if (!["r", "b", "c", "s"].includes(k)) return;
      const nextRows = [...rows, { ok: k === correct, rt: now() - started, sw: cue !== stim.prev }];
      if (trial >= 23) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1, cue); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, cue, stim, started, rows, trial]);
  const sw = rows.filter((r) => r.sw && r.ok).map((r) => r.rt), rep = rows.filter((r) => !r.sw && r.ok).map((r) => r.rt);
  return (
    <GameShell cite="Jersild, 1927" instructions={<><span className="kbd">R/B</span> colour <span className="kbd">C/S</span> circle/square</>} phase={phase} headline="change the rule" explain="The cue tells you whether colour or shape matters on this trial." onBegin={begin} onReset={begin} footer={`trial ${Math.min(trial + 1, 24)}/24 · cue ${cue}`} results={[{ label: "repeat", value: `${mean(rep)} ms` }, { label: "switch", value: `${mean(sw)} ms` }, { label: "switch cost", value: `${Math.max(0, mean(sw) - mean(rep))} ms` }]} doneText="Switch cost is the small delay from disengaging one rule and loading another.">
      <div className="center-stack"><span className="pill">{cue}</span><div className="mono-big" style={{ color: stim?.color === "red" ? "#9bd8f4" : "#7fbce6" }}>{stim?.shape}</div></div>
    </GameShell>
  );
}

function WCST() {
  const refs = [{ c: "#9bd8f4", s: "●", n: 1 }, { c: "#7fbce6", s: "■", n: 2 }, { c: "#a9cfff", s: "▲", n: 3 }, { c: "#c5deff", s: "◆", n: 4 }];
  const rules = ["c", "s", "n"];
  const [phase, setPhase] = useState("intro"), [rule, setRule] = useState(0), [correct, setCorrect] = useState(0), [card, setCard] = useState(null), [trials, setTrials] = useState(0), [persev, setPersev] = useState(0), [lastRule, setLastRule] = useState("c"), [fb, setFb] = useState("");
  function deal() { setCard({ c: choice(refs).c, s: choice(refs).s, n: choice(refs).n }); }
  function begin() { setRule(0); setCorrect(0); setTrials(0); setPersev(0); setLastRule("c"); setFb(""); setPhase("running"); deal(); }
  function renderCard(x) { return <div>{Array.from({ length: x.n }, (_, i) => <span key={i} style={{ color: x.c, fontSize: 28, padding: 2 }}>{x.s}</span>)}</div>; }
  function pick(ref) {
    const r = rules[rule]; const ok = card[r] === ref[r]; setFb(ok ? "correct" : "wrong");
    if (!ok && card[lastRule] === ref[lastRule]) setPersev(persev + 1);
    const nextCorrect = ok ? correct + 1 : 0; const nextTrials = trials + 1;
    if (nextCorrect >= 10) { setLastRule(r); setRule((rule + 1) % rules.length); setCorrect(0); } else setCorrect(nextCorrect);
    if (nextTrials >= 36) setPhase("done"); else { setTrials(nextTrials); deal(); }
  }
  return (
    <GameShell cite="Berg, 1948" instructions="sort the lower card; feedback reveals the hidden rule" phase={phase} headline="find the rule" explain="Match by colour, shape, or number. The rule changes silently after a run of correct choices." onBegin={begin} onReset={begin} footer={`trial ${trials}/36 · ${fb || "waiting"}`} results={[{ label: "rules found", value: rule }, { label: "perseverative", value: persev }, { label: "trials", value: trials }]} doneText="Perseverative errors happen when the old rule keeps steering after the task has changed.">
      <div className="center-stack"><div className="card-sort">{refs.map((r, i) => <button key={i} className="sort-card" onClick={() => pick(r)}>{renderCard(r)}</button>)}</div>{card && <div className="sort-card" style={{ width: 150 }}>{renderCard(card)}</div>}</div>
    </GameShell>
  );
}

Object.assign(window, { TaskSwitch, WCST });
}
