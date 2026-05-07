{
const { GameShell, choice, mean, rand, sd, useEffect, useRef, useState } = window.GameKit;

function StopSignal() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [dir, setDir] = useState("left"), [stop, setStop] = useState(false), [red, setRed] = useState(false), [ssd, setSsd] = useState(220), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function next(n = 0, delay = ssd) { const s = Math.random() < 0.3; setTrial(n); setDir(choice(["left", "right"])); setStop(s); setRed(false); setStart(performance.now()); if (s) setTimeout(() => setRed(true), delay); }
  function begin() { setRows([]); setSsd(220); setPhase("running"); next(0, 220); }
  function finish(row) { const nextRows = [...rows, row]; const nextSsd = row.stop ? Math.max(70, Math.min(500, ssd + (row.inhibit ? 50 : -50))) : ssd; setSsd(nextSsd); if (trial >= 23) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(trial + 1, nextSsd); } }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const timeout = setTimeout(() => { if (stop && red) finish({ stop: true, inhibit: true, rt: 0 }); else finish({ stop, inhibit: false, rt: 900 }); }, 900);
    const onKey = (e) => { if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return; finish({ stop, inhibit: false, ok: (e.key === "ArrowLeft") === (dir === "left"), rt: performance.now() - start }); };
    window.addEventListener("keydown", onKey); return () => { clearTimeout(timeout); window.removeEventListener("keydown", onKey); };
  }, [phase, stop, red, dir, start, rows, trial, ssd]);
  const go = rows.filter((r) => !r.stop && r.ok).map((r) => r.rt);
  return <GameShell cite="Logan & Cowan, 1984" instructions={
        <ol>
          <li>An arrow appears — press <span className="kbd">←</span> or <span className="kbd">→</span> to match its direction.</li>
          <li>If the arrow turns <strong>blue</strong>, withhold your response entirely.</li>
          <li>The delay before the stop signal adjusts to keep stopping difficult.</li>
          <li>24 trials — go fast but stay ready to stop.</li>
        </ol>
      } phase={phase} headline="race yourself" explain="Go starts first. Sometimes a stop signal tries to catch it." onBegin={begin} onReset={begin} footer={`trial ${trial + 1}/24 · SSD ${ssd}ms`} results={[{ label: "go RT", value: `${mean(go)} ms` }, { label: "final SSD", value: `${ssd} ms` }, { label: "SSRT", value: `${Math.max(0, mean(go) - ssd)} ms` }]} doneText="SSRT is estimated as mean go speed minus the delay where stopping still succeeds."><div className="mono-big" style={{ color: red ? "#9bd8f4" : "#315a78" }}>{dir === "left" ? "←" : "→"}</div></GameShell>;
}

function Hanoi() {
  const [phase, setPhase] = useState("intro"), [pegs, setPegs] = useState([[3, 2, 1], [], []]), [held, setHeld] = useState(null), [moves, setMoves] = useState(0), [start, setStart] = useState(0), [elapsed, setElapsed] = useState(0);
  function begin() { setPegs([[3, 2, 1], [], []]); setHeld(null); setMoves(0); setStart(Date.now()); setElapsed(0); setPhase("running"); }
  useEffect(() => { if (phase !== "running") return undefined; const t = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 500); return () => clearInterval(t); }, [phase, start]);
  function peg(i) {
    const p = pegs.map((x) => [...x]);
    if (held) { const top = p[i][p[i].length - 1]; if (!top || held.disc < top) { p[i].push(held.disc); setPegs(p); setHeld(null); setMoves(moves + 1); if (i === 2 && p[2].length === 3) setPhase("done"); } }
    else if (p[i].length) { const disc = p[i].pop(); setPegs(p); setHeld({ disc, from: i }); }
  }
  return <GameShell cite="Édouard Lucas, 1883" instructions={
        <ol>
          <li>Three pegs hold a tower of discs ordered by size (largest at bottom).</li>
          <li><strong>Click a peg</strong> to pick up its top disc, then click a destination peg to place it.</li>
          <li>You may <strong>never</strong> place a larger disc on a smaller one.</li>
          <li>Move the whole tower to the rightmost peg — minimum is 7 moves.</li>
        </ol>
      } phase={phase} headline="move the tower" explain="Never place a larger disc on a smaller one. Three discs can be solved in seven moves." onBegin={begin} onReset={begin} footer={`${moves} moves · ${elapsed}s`} results={[{ label: "moves", value: moves }, { label: "optimal", value: 7 }, { label: "time", value: `${elapsed}s` }]} doneText="Hanoi rewards looking ahead: the spare peg is not empty space, it is a temporary thought."><div className="hanoi">{pegs.map((p, i) => <button className="peg" key={i} onClick={() => peg(i)}>{p.map((d) => <span key={d} className="disc" style={{ width: 42 + d * 28 }}></span>)}{held?.from === i && <span className="disc held" style={{ width: 42 + held.disc * 28 }}></span>}</button>)}</div></GameShell>;
}

function TrailMaking() {
  const [phase, setPhase] = useState("intro"), [mode, setMode] = useState("A"), [idx, setIdx] = useState(0), [start, setStart] = useState(0), [time, setTime] = useState(0), [hits, setHits] = useState([]);
  const nodes = Array.from({ length: 15 }, (_, i) => ({ label: mode === "A" ? String(i + 1) : (i % 2 ? String.fromCharCode(65 + Math.floor(i / 2)) : String(i / 2 + 1)), x: 60 + (i * 97) % 540, y: 45 + (i * 67) % 230 }));
  function begin() { setMode(mode); setIdx(0); setHits([]); setStart(Date.now()); setTime(0); setPhase("running"); }
  useEffect(() => { if (phase !== "running") return undefined; const t = setInterval(() => setTime(Math.round((Date.now() - start) / 1000)), 250); return () => clearInterval(t); }, [phase, start]);
  function hit(i) { if (i !== idx) return; const h = [...hits, nodes[i]]; setHits(h); if (i === nodes.length - 1) setPhase("done"); else setIdx(i + 1); }
  return <GameShell cite="Reitan, 1958" instructions={
        <ol>
          <li>Circles labelled with numbers or letters are scattered on screen.</li>
          <li><strong>Mode A:</strong> click in ascending number order (1 → 2 → 3…).</li>
          <li><strong>Mode B:</strong> alternate numbers and letters (1 → A → 2 → B…).</li>
          <li>Click the <em>pulsing</em> circle next — wrong clicks are ignored. Choose mode before starting.</li>
        </ol>
      } phase={phase} headline="draw the trail" explain="Version A counts upward. Version B alternates letters and numbers." onBegin={begin} onReset={begin} footer={phase === "intro" ? <button className="ghost-btn" onClick={() => setMode(mode === "A" ? "B" : "A")}>mode {mode}</button> : `mode ${mode} · ${time}s`} results={[{ label: "mode", value: mode }, { label: "time", value: `${time}s` }, { label: "nodes", value: hits.length }]} doneText="Trail B adds set-shifting to visual search: the next item lives in two sequences at once."><svg className="svg-stage" viewBox="0 0 680 320">{hits.map((p, i) => i ? <line key={i} x1={hits[i - 1].x} y1={hits[i - 1].y} x2={p.x} y2={p.y} stroke="#9bd8f4" strokeDasharray="5 5"></line> : null)}{nodes.map((n, i) => <g key={i} onClick={() => hit(i)}><circle cx={n.x} cy={n.y} r="18" fill={i < idx ? "#9bd8f4" : "#f3fbff"} stroke="#315a78" className={i === idx ? "flash" : ""}></circle><text x={n.x} y={n.y + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="12">{n.label}</text></g>)}</svg></GameShell>;
}

function Necker() {
  const [phase, setPhase] = useState("intro"), [flips, setFlips] = useState(0), [left, setLeft] = useState(30);
  function begin() { setFlips(0); setLeft(30); setPhase("running"); }
  useEffect(() => { if (phase !== "running") return undefined; const t = setInterval(() => setLeft((x) => { if (x <= 1) { setPhase("done"); return 0; } return x - 1; }), 1000); return () => clearInterval(t); }, [phase]);
  return <GameShell cite="Necker, 1832" instructions={
        <ol>
          <li>Look steadily at the wire-frame cube below.</li>
          <li>It can be seen from two viewpoints — which face looks like the front can flip.</li>
          <li><strong>Click anywhere on the cube</strong> each time your perceived front face switches.</li>
          <li>Watch for 30 seconds and count your natural reversals.</li>
        </ol>
      } phase={phase} headline="watch it reverse" explain="The drawing stays still; perception changes the front face." onBegin={begin} onReset={begin} footer={`${left}s remaining · ${flips} flips`} results={[{ label: "flips", value: flips }, { label: "duration", value: "30s" }, { label: "rate", value: `${Math.round(flips * 2)}/min` }]} doneText="Bistable perception is a living toggle: the stimulus is constant, the interpretation is not."><div className="center-stack" onClick={() => setFlips(flips + 1)}><svg width="240" height="210" viewBox="0 0 240 210"><path d="M65 45 h95 v95 h-95z M95 75 h95 v95 h-95z M65 45 l30 30 M160 45 l30 30 M160 140 l30 30 M65 140 l30 30" fill="none" stroke="#315a78" strokeWidth="3"></path></svg><div className="progress"><i style={{ width: `${left / 30 * 100}%` }}></i></div></div></GameShell>;
}

function MOT() {
  const canvasRef = useRef(null); const dots = useRef([]);
  const [phase, setPhase] = useState("intro"), [select, setSelect] = useState(false), [picks, setPicks] = useState([]);
  function begin() { dots.current = Array.from({ length: 8 }, (_, i) => ({ x: rand(40, 600), y: rand(40, 340), vx: rand(-2, 2) || 1, vy: rand(-2, 2) || 1, target: i < 4 })); setPicks([]); setSelect(false); setPhase("running"); setTimeout(() => setSelect(true), 9500); }
  useEffect(() => {
    if (phase !== "running") return undefined; let raf;
    const draw = () => { const c = canvasRef.current, ctx = c.getContext("2d"); ctx.clearRect(0, 0, 640, 380); dots.current.forEach((d) => { if (!select) { d.x += d.vx; d.y += d.vy; if (d.x < 14 || d.x > 626) d.vx *= -1; if (d.y < 14 || d.y > 366) d.vy *= -1; } ctx.beginPath(); ctx.arc(d.x, d.y, 12, 0, Math.PI * 2); ctx.fillStyle = picks.includes(d) ? (d.target ? "#7fbce6" : "#b7c8ff") : (!select && d.target ? "#9bd8f4" : "#315a78"); ctx.fill(); }); raf = requestAnimationFrame(draw); };
    draw(); const done = setTimeout(() => setSelect(true), 9500); return () => { cancelAnimationFrame(raf); clearTimeout(done); };
  }, [phase, select, picks]);
  function click(e) { if (!select) return; const r = e.currentTarget.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const d = dots.current.find((p) => Math.hypot(p.x - x, p.y - y) < 18); if (d && !picks.includes(d)) { const next = [...picks, d]; setPicks(next); if (next.length === 4) setPhase("done"); } }
  const correct = picks.filter((p) => p.target).length;
  return <GameShell cite="Pylyshyn & Storm, 1988" instructions={
        <ol>
          <li>Four dots briefly glow blue — these are your <strong>targets</strong> to track.</li>
          <li>All dots then become identical and start moving for ~9.5 seconds.</li>
          <li>When the dots stop, <strong>click the four original targets</strong>.</li>
          <li>You must select exactly 4 dots to finish.</li>
        </ol>
      } phase={phase} headline="keep the tags" explain="Four dots start highlighted, then all dots become identical and move." onBegin={begin} onReset={begin} footer={select ? `select targets · ${picks.length}/4` : "tracking interval"} results={[{ label: "correct", value: `${correct}/4` }, { label: "objects", value: 8 }, { label: "tracked", value: 4 }]} doneText="MOT asks attention to preserve object identities across motion and distraction."><canvas ref={canvasRef} width="640" height="380" onClick={click} style={{ maxWidth: "100%", border: "1px solid #b8d8ef", background: "#f3fbff" }}></canvas></GameShell>;
}

function BeatTap() {
  const [phase, setPhase] = useState("intro"), [taps, setTaps] = useState([]), audioRef = useRef(null), beatRef = useRef(null);
  function tick(ctx) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 240; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1); o.start(); o.stop(ctx.currentTime + 0.11); }
  function begin() { const ctx = new (window.AudioContext || window.webkitAudioContext)(); audioRef.current = ctx; setTaps([]); setPhase("running"); beatRef.current = setInterval(() => tick(ctx), 600); tick(ctx); }
  useEffect(() => () => { clearInterval(beatRef.current); audioRef.current?.close?.(); }, []);
  function tap() { const next = [...taps, performance.now()]; setTaps(next); if (next.length >= 18) { clearInterval(beatRef.current); audioRef.current?.close?.(); setPhase("done"); } }
  const iti = taps.slice(1).map((t, i) => t - taps[i]);
  return <GameShell cite="Repp, 2005" instructions={
        <ol>
          <li>A metronome clicks every <strong>600 ms</strong> (100 BPM).</li>
          <li>Tap the button or click the stage in time with each click.</li>
          <li>Try to synchronise — tap right as you hear each beat.</li>
          <li>The task ends automatically after 18 taps.</li>
        </ol>
      } phase={phase} headline="meet the beat" explain="A metronome clicks every 600 ms. Tap along until the run ends." onBegin={begin} onReset={begin} footer={`${taps.length}/18 taps`} results={[{ label: "mean ITI", value: `${mean(iti)} ms` }, { label: "ITI SD", value: `${sd(iti)} ms` }, { label: "target", value: "600 ms" }]} doneText="Synchronization is prediction with feedback: your taps reveal how tightly the next beat was anticipated."><div className="center-stack" onClick={tap}><div className="mono-big">♪</div><button className="choice-btn">tap here</button></div></GameShell>;
}

Object.assign(window, { StopSignal, Hanoi, TrailMaking, Necker, MOT, BeatTap });
}
