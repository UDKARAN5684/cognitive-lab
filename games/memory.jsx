{
const { GameShell, choice, mean, rand, shuffle, useEffect, useState } = window.GameKit;

function DigitSpan() {
  const [phase, setPhase] = useState("intro");
  const [level, setLevel] = useState(3);
  const [seq, setSeq] = useState([]);
  const [show, setShow] = useState("");
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState(0);
  const [best, setBest] = useState(0);
  function begin() { setLevel(3); setErrors(0); setBest(0); setAnswer(""); setPhase("running"); run(3); }
  function run(len) {
    const s = Array.from({ length: len }, () => String(rand(0, 9)));
    setSeq(s); setAnswer(""); let k = 0; setShow("");
    const timer = setInterval(() => { setShow(s[k] || "?"); k++; if (k > s.length) { clearInterval(timer); setShow(""); } }, 650);
  }
  function submit() {
    const ok = answer === seq.join("");
    if (ok) { setBest(Math.max(best, level)); setLevel(level + 1); run(level + 1); }
    else if (errors + 1 >= 2) { setErrors(errors + 1); setPhase("done"); }
    else { setErrors(errors + 1); run(level); }
  }
  return (
    <GameShell cite="Jacobs, 1887" instructions={
        <ol>
          <li>Digits flash one at a time on screen.</li>
          <li>When the display clears, <strong>type all the digits in order</strong> and submit.</li>
          <li>Each correct round adds one more digit to the next sequence.</li>
          <li>Two errors end the task — see how long a string you can hold.</li>
        </ol>
      } phase={phase} headline="hold the string" explain="Digits appear one at a time. When the stage clears, type the whole sequence." onBegin={begin} onReset={begin} footer={`level ${level} · errors ${errors}/2`} results={[{ label: "best span", value: best }, { label: "final length", value: level }, { label: "errors", value: errors }]} doneText="Digit span is the old pocket ruler of immediate verbal memory.">
      <div className="center-stack">
        <div className="mono-big">{show || "· · ·"}</div>
        {!show && <><input className="text-input" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))} autoFocus="autoFocus" /><button className="primary-btn" onClick={submit}>submit →</button></>}
      </div>
    </GameShell>
  );
}

function Corsi() {
  const [phase, setPhase] = useState("intro");
  const [level, setLevel] = useState(3);
  const [seq, setSeq] = useState([]);
  const [lit, setLit] = useState(-1);
  const [clicks, setClicks] = useState([]);
  const [best, setBest] = useState(0);
  function play(len) {
    const s = Array.from({ length: len }, () => rand(0, 8)); setSeq(s); setClicks([]); let k = 0; setLit(-1);
    const timer = setInterval(() => { setLit(s[k] ?? -1); k++; if (k > s.length) { clearInterval(timer); setTimeout(() => setLit(-1), 300); } }, 520);
  }
  function begin() { setBest(0); setLevel(3); setPhase("running"); play(3); }
  function tap(n) {
    if (lit !== -1) return;
    const next = [...clicks, n]; setClicks(next);
    if (next.length === seq.length) {
      const ok = next.every((v, idx) => v === seq[idx]);
      if (ok) { setBest(Math.max(best, level)); setLevel(level + 1); play(level + 1); } else setPhase("done");
    }
  }
  return (
    <GameShell cite="Corsi, 1972" instructions={
        <ol>
          <li>Nine blocks are arranged on screen.</li>
          <li>Watch them light up in a <strong>spatial sequence</strong>.</li>
          <li>After the display, <strong>click the blocks in the same order</strong>.</li>
          <li>Sequences grow by one each correct round — one error ends the task.</li>
        </ol>
      } phase={phase} headline="remember the path" explain="Nine blocks light in a spatial sequence. Give the route back." onBegin={begin} onReset={begin} footer={`span ${level} · clicks ${clicks.length}/${seq.length}`} results={[{ label: "best span", value: best }, { label: "attempted", value: level }, { label: "blocks", value: 9 }]} doneText="Corsi swaps spoken memory for spatial memory: no digits, only places.">
      <div className="grid-board" style={{ gridTemplateColumns: "repeat(3, 64px)" }}>
        {Array.from({ length: 9 }, (_, n) => <button key={n} className={lit === n ? "memory-block on" : "memory-block"} onClick={() => tap(n)}></button>)}
      </div>
    </GameShell>
  );
}

function Sternberg() {
  const [phase, setPhase] = useState("intro");
  const [trial, setTrial] = useState(0);
  const [set, setSet] = useState([]);
  const [probe, setProbe] = useState("");
  const [showSet, setShowSet] = useState(false);
  const [started, setStarted] = useState(0);
  const [rows, setRows] = useState([]);
  function next(n = 0) {
    const size = (n % 6) + 1; const s = shuffle("123456789".split("")).slice(0, size); const yes = Math.random() > 0.5;
    setTrial(n); setSet(s); setProbe(yes ? choice(s) : choice("123456789".split("").filter((d) => !s.includes(d)))); setShowSet(true);
    setTimeout(() => { setShowSet(false); setStarted(performance.now()); }, 900);
  }
  function begin() { setRows([]); setPhase("running"); next(0); }
  useEffect(() => {
    if (phase !== "running" || showSet) return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase(); if (!["y", "n"].includes(k)) return;
      const ok = (k === "y") === set.includes(probe); const nextRows = [...rows, { ok, rt: performance.now() - started, size: set.length }];
      if (trial >= 17) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, showSet, set, probe, started, rows, trial]);
  return (
    <GameShell cite="Sternberg, 1966" instructions={
        <ol>
          <li>A set of digits appears briefly, then disappears.</li>
          <li>A single <strong>probe digit</strong> is then shown.</li>
          <li>Press <span className="kbd">Y</span> if it was in the set · <span className="kbd">N</span> if not.</li>
          <li>18 trials — set size varies from 1 to 6.</li>
        </ol>
      } phase={phase} headline="scan memory" explain="A short set appears, then a probe asks whether it was there." onBegin={begin} onReset={begin} footer={`trial ${Math.min(trial + 1, 18)}/18 · set size ${set.length}`} results={[{ label: "mean RT", value: `${mean(rows.map((r) => r.rt))} ms` }, { label: "small sets", value: `${mean(rows.filter((r) => r.size <= 3).map((r) => r.rt))} ms` }, { label: "large sets", value: `${mean(rows.filter((r) => r.size > 3).map((r) => r.rt))} ms` }]} doneText="Sternberg's signature result is a near-linear rise in RT as memory set size grows.">
      <div className="mono-big">{showSet ? set.join(" ") : probe}</div>
    </GameShell>
  );
}

function PairedAssociates() {
  const pairs = [["MOON", "CLOCK"], ["RIVER", "VELVET"], ["BREAD", "LAMP"], ["CLOUD", "PIANO"], ["CHAIR", "APPLE"], ["STONE", "WINDOW"]];
  const [phase, setPhase] = useState("intro");
  const [study, setStudy] = useState(true);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  function begin() { setStudy(true); setI(0); setScore(0); setAnswer(""); setPhase("running"); setTimeout(() => setStudy(false), 6000); }
  function submit() {
    const ok = answer.trim().toUpperCase() === pairs[i][1]; setScore(score + (ok ? 1 : 0)); setAnswer("");
    if (i >= pairs.length - 1) setPhase("done"); else setI(i + 1);
  }
  return (
    <GameShell cite="Calkins, 1894" instructions={
        <ol>
          <li>Six word pairs are shown together for 6 seconds — study them.</li>
          <li>The pairs then disappear and you are shown the <strong>first word</strong> of each pair.</li>
          <li>Type its partner and submit.</li>
          <li>6 cues in total — spelling must match exactly.</li>
        </ol>
      } phase={phase} headline="make a link" explain="Learn six odd word pairs. The cue will ask for its companion." onBegin={begin} onReset={begin} footer={study ? "study window · 6 seconds" : `cue ${i + 1}/6`} results={[{ label: "recalled", value: `${score}/6` }, { label: "pairs", value: 6 }, { label: "method", value: "cue" }]} doneText="Paired associates make learning visible as a newly forged bond between two arbitrary things.">
      <div className="center-stack">
        {study ? <div className="pill-row">{pairs.map((p) => <span className="pill" key={p[0]}>{p[0]} - {p[1]}</span>)}</div> : <><div className="task-headline">{pairs[i][0]} → ?</div><input className="text-input" value={answer} onChange={(e) => setAnswer(e.target.value)} /><button className="primary-btn" onClick={submit}>answer →</button></>}
      </div>
    </GameShell>
  );
}

Object.assign(window, { DigitSpan, Corsi, Sternberg, PairedAssociates });
}
