{
const { GameShell, mean, rand, sd, useEffect, useState } = window.GameKit;

function SimpleRT() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [ready, setReady] = useState(false), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function arm(n = 0) { setTrial(n); setReady(false); setTimeout(() => { setReady(true); setStart(performance.now()); }, rand(1000, 3000)); }
  function begin() { setRows([]); setPhase("running"); arm(0); }
  function click() { if (!ready) return; const next = [...rows, performance.now() - start]; if (trial >= 4) { setRows(next); setPhase("done"); } else { setRows(next); arm(trial + 1); } }
  return <GameShell cite="Donders, 1868" instructions={
        <ol>
          <li>The stage starts grey — wait quietly.</li>
          <li>When it turns <strong>blue</strong>, click as fast as you can.</li>
          <li>The wait before the signal is random — don't anticipate.</li>
          <li>5 trials in total.</li>
        </ol>
      } phase={phase} headline="one signal" explain="No choice, no puzzle: just stimulus to movement." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/5`} results={[{ label: "mean RT", value: `${mean(rows)} ms` }, { label: "fastest", value: `${Math.round(Math.min(...rows))} ms` }, { label: "trials", value: rows.length }]} doneText="Simple reaction time is the leanest measure here: readiness, perception, movement."><div className="center-stack" onClick={click} style={{ width: "100%", height: "260px", background: ready ? "#b6e4fb" : "transparent" }}><div className="task-headline">{ready ? "click" : "wait"}</div></div></GameShell>;
}

function Subitizing() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [n, setN] = useState(1), [show, setShow] = useState(false), [answer, setAnswer] = useState(""), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function next(t = 0) { const k = (t % 9) + 1; setTrial(t); setN(k); setAnswer(""); setShow(true); setStart(performance.now()); setTimeout(() => setShow(false), 220); }
  function begin() { setRows([]); setPhase("running"); next(0); }
  function submit() { const nextRows = [...rows, { n, ok: Number(answer) === n, rt: performance.now() - start }]; if (trial >= 17) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); } }
  return <GameShell cite="Kaufman et al., 1949" instructions={
        <ol>
          <li>Dots appear on screen for just <strong>220 ms</strong>.</li>
          <li>Count how many you saw, then type the number.</li>
          <li>Hit submit to continue — the stage clears when you answer.</li>
          <li>18 trials — set sizes go from 1 to 9 dots.</li>
        </ol>
      } phase={phase} headline="instant number" explain="Small sets are often seen at once; larger sets begin to ask for counting." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/18`} results={[{ label: "accuracy", value: `${Math.round(rows.filter((r) => r.ok).length / Math.max(1, rows.length) * 100)}%` }, { label: "1-4 RT", value: `${mean(rows.filter((r) => r.n <= 4).map((r) => r.rt))} ms` }, { label: "5-9 RT", value: `${mean(rows.filter((r) => r.n > 4).map((r) => r.rt))} ms` }]} doneText="The subitizing range is the flat part of numerosity: quick, confident, and small."><div className="center-stack">{show ? <div style={{ position: "relative", width: 360, height: 210 }}>{Array.from({ length: n }, (_, i) => <span key={i} className="dot target-dot" style={{ position: "absolute", left: 20 + (i * 83) % 300, top: 20 + (i * 59) % 150 }}></span>)}</div> : <><input className="text-input" value={answer} onChange={(e) => setAnswer(e.target.value)} /><button className="primary-btn" onClick={submit}>submit →</button></>}</div></GameShell>;
}

function PVT() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [live, setLive] = useState(false), [start, setStart] = useState(0), [clock, setClock] = useState(0), [rows, setRows] = useState([]);
  function arm(t = 0) { setTrial(t); setLive(false); setClock(0); setTimeout(() => { setLive(true); const started = performance.now(); setStart(started); setClock(0); }, rand(1200, 5000)); }
  function begin() { setRows([]); setClock(0); setPhase("running"); arm(0); }
  useEffect(() => {
    if (phase !== "running" || !live) return undefined;
    const timer = setInterval(() => setClock(performance.now() - start), 50);
    return () => clearInterval(timer);
  }, [phase, live, start]);
  function click() { if (!live) return; const next = [...rows, performance.now() - start]; if (trial >= 11) { setRows(next); setPhase("done"); } else { setRows(next); arm(trial + 1); } }
  return <GameShell cite="Dinges & Powell, 1985" instructions={
        <ol>
          <li>Watch the stage — a counter will appear after a random delay.</li>
          <li><strong>Click</strong> the moment you see the counter start running.</li>
          <li>Wait times vary unpredictably to test sustained vigilance.</li>
          <li>12 trials — lapses over 500 ms are flagged separately.</li>
        </ol>
      } phase={phase} headline="stay ready" explain="The waits are uneven. Vigilance is the work of remaining prepared." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/12`} results={[{ label: "mean RT", value: `${mean(rows)} ms` }, { label: "lapses >500", value: rows.filter((r) => r > 500).length }, { label: "variability", value: `${sd(rows)} ms` }]} doneText="PVT lapses are not wrong choices, just attention arriving late."><div className="center-stack" onClick={click}><div className="mono-big">{live ? Math.round(clock) : "..."}</div></div></GameShell>;
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
  return <GameShell cite="Wing & Kristofferson, 1973" instructions={
        <ol>
          <li>Choose a comfortable tapping rhythm — any tempo you like.</li>
          <li>Press <span className="kbd">Space</span> 24 times at that steady pace.</li>
          <li>Try to keep each interval as equal as possible.</li>
          <li>The variability in your intervals reveals your motor timing noise.</li>
        </ol>
      } phase={phase} headline="make a clock" explain="Pick a comfortable rhythm and keep it regular." onBegin={begin} onReset={begin} footer={`${taps.length}/24 taps`} results={[{ label: "mean ITI", value: `${mean(iti)} ms` }, { label: "ITI SD", value: `${sd(iti)} ms` }, { label: "taps", value: taps.length }]} doneText="Regular tapping separates your chosen tempo from the small motor noise around it."><div className="center-stack"><div className="mono-big">{taps.length}</div></div></GameShell>;
}

function SubjectiveTime() {
  const [phase, setPhase] = useState("intro"), [target, setTarget] = useState(7), [start, setStart] = useState(0), [elapsed, setElapsed] = useState(0);
  function begin() { const t = rand(5, 12); setTarget(t); setElapsed(0); setStart(performance.now()); setPhase("running"); }
  function stop() { setElapsed((performance.now() - start) / 1000); setPhase("done"); }
  return <GameShell cite="Vierordt, 1868" instructions={
        <ol>
          <li>A target duration (5–12 seconds) is displayed.</li>
          <li>Press <strong>"now →"</strong> when you think that exact amount of time has passed.</li>
          <li>Try not to count — estimate naturally from your internal sense of time.</li>
          <li>One trial — your error reveals your subjective clock's bias.</li>
        </ol>
      } phase={phase} headline="feel the seconds" explain="Produce a duration from the inside, without watching a clock." onBegin={begin} onReset={begin} footer={`target ${target}s`} results={[{ label: "target", value: `${target}s` }, { label: "produced", value: `${elapsed.toFixed(1)}s` }, { label: "error", value: `${(elapsed - target).toFixed(1)}s` }]} doneText="Subjective time is elastic: attention, arousal, and strategy all tug at the interval."><div className="center-stack"><div className="task-headline">{target} seconds</div><button className="primary-btn" onClick={stop}>now →</button></div></GameShell>;
}

Object.assign(window, { SimpleRT, Subitizing, PVT, Tapping, SubjectiveTime });
}
