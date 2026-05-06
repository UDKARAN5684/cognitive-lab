{
const { GameShell, mean, rand, sd, useEffect, useState } = window.GameKit;

function SimpleRT() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [ready, setReady] = useState(false), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function arm(n = 0) { setTrial(n); setReady(false); setTimeout(() => { setReady(true); setStart(performance.now()); }, rand(1000, 3000)); }
  function begin() { setRows([]); setPhase("running"); arm(0); }
  function click() { if (!ready) return; const next = [...rows, performance.now() - start]; if (trial >= 4) { setRows(next); setPhase("done"); } else { setRows(next); arm(trial + 1); } }
  return <GameShell cite="Donders, 1868" instructions="wait for blue, then click" phase={phase} headline="one signal" explain="No choice, no puzzle: just stimulus to movement." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/5`} results={[{ label: "mean RT", value: `${mean(rows)} ms` }, { label: "fastest", value: `${Math.round(Math.min(...rows))} ms` }, { label: "trials", value: rows.length }]} doneText="Simple reaction time is the leanest measure here: readiness, perception, movement."><div className="center-stack" onClick={click} style={{ width: "100%", height: "260px", background: ready ? "#b6e4fb" : "transparent" }}><div className="task-headline">{ready ? "click" : "wait"}</div></div></GameShell>;
}

function Subitizing() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [n, setN] = useState(1), [show, setShow] = useState(false), [answer, setAnswer] = useState(""), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function next(t = 0) { const k = (t % 9) + 1; setTrial(t); setN(k); setAnswer(""); setShow(true); setStart(performance.now()); setTimeout(() => setShow(false), 220); }
  function begin() { setRows([]); setPhase("running"); next(0); }
  function submit() { const nextRows = [...rows, { n, ok: Number(answer) === n, rt: performance.now() - start }]; if (trial >= 17) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); } }
  return <GameShell cite="Kaufman et al., 1949" instructions="type how many dots flashed" phase={phase} headline="instant number" explain="Small sets are often seen at once; larger sets begin to ask for counting." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/18`} results={[{ label: "accuracy", value: `${Math.round(rows.filter((r) => r.ok).length / Math.max(1, rows.length) * 100)}%` }, { label: "1-4 RT", value: `${mean(rows.filter((r) => r.n <= 4).map((r) => r.rt))} ms` }, { label: "5-9 RT", value: `${mean(rows.filter((r) => r.n > 4).map((r) => r.rt))} ms` }]} doneText="The subitizing range is the flat part of numerosity: quick, confident, and small."><div className="center-stack">{show ? <div style={{ position: "relative", width: 360, height: 210 }}>{Array.from({ length: n }, (_, i) => <span key={i} className="dot target-dot" style={{ position: "absolute", left: 20 + (i * 83) % 300, top: 20 + (i * 59) % 150 }}></span>)}</div> : <><input className="text-input" value={answer} onChange={(e) => setAnswer(e.target.value)} /><button className="primary-btn" onClick={submit}>submit →</button></>}</div></GameShell>;
}

function PVT() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [live, setLive] = useState(false), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function arm(t = 0) { setTrial(t); setLive(false); setTimeout(() => { setLive(true); setStart(performance.now()); }, rand(1200, 5000)); }
  function begin() { setRows([]); setPhase("running"); arm(0); }
  function click() { if (!live) return; const next = [...rows, performance.now() - start]; if (trial >= 11) { setRows(next); setPhase("done"); } else { setRows(next); arm(trial + 1); } }
  return <GameShell cite="Dinges & Powell, 1985" instructions="click when the counter appears; demo is shortened" phase={phase} headline="stay ready" explain="The waits are uneven. Vigilance is the work of remaining prepared." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/12`} results={[{ label: "mean RT", value: `${mean(rows)} ms` }, { label: "lapses >500", value: rows.filter((r) => r > 500).length }, { label: "variability", value: `${sd(rows)} ms` }]} doneText="PVT lapses are not wrong choices, just attention arriving late."><div className="center-stack" onClick={click}><div className="mono-big">{live ? Math.round(performance.now() - start) : "..."}</div></div></GameShell>;
}

function Tapping() {
  const [phase, setPhase] = useState("intro"), [taps, setTaps] = useState([]);
  function begin() { setTaps([]); setPhase("running"); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => { if (e.code !== "Space") return; e.preventDefault(); const next = [...taps, performance.now()]; setTaps(next); if (next.length >= 24) setPhase("done"); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, taps]);
  const iti = taps.slice(1).map((t, i) => t - taps[i]);
  return <GameShell cite="Wing & Kristofferson, 1973" instructions={<><span className="kbd">Space</span> tap at a steady rhythm</>} phase={phase} headline="make a clock" explain="Pick a comfortable rhythm and keep it regular." onBegin={begin} onReset={begin} footer={`${taps.length}/24 taps`} results={[{ label: "mean ITI", value: `${mean(iti)} ms` }, { label: "ITI SD", value: `${sd(iti)} ms` }, { label: "taps", value: taps.length }]} doneText="Regular tapping separates your chosen tempo from the small motor noise around it."><div className="center-stack"><div className="mono-big">{taps.length}</div></div></GameShell>;
}

function SubjectiveTime() {
  const [phase, setPhase] = useState("intro"), [target, setTarget] = useState(7), [start, setStart] = useState(0), [elapsed, setElapsed] = useState(0);
  function begin() { const t = rand(5, 12); setTarget(t); setElapsed(0); setStart(performance.now()); setPhase("running"); }
  function stop() { setElapsed((performance.now() - start) / 1000); setPhase("done"); }
  return <GameShell cite="Vierordt, 1868" instructions="click when you think the target duration has passed; try not to count" phase={phase} headline="feel the seconds" explain="Produce a duration from the inside, without watching a clock." onBegin={begin} onReset={begin} footer={`target ${target}s`} results={[{ label: "target", value: `${target}s` }, { label: "produced", value: `${elapsed.toFixed(1)}s` }, { label: "error", value: `${(elapsed - target).toFixed(1)}s` }]} doneText="Subjective time is elastic: attention, arousal, and strategy all tug at the interval."><div className="center-stack"><div className="task-headline">{target} seconds</div><button className="primary-btn" onClick={stop}>now →</button></div></GameShell>;
}

Object.assign(window, { SimpleRT, Subitizing, PVT, Tapping, SubjectiveTime });
}
