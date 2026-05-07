{
const { GameShell, choice, mean, now, useEffect, useState } = window.GameKit;

function NBack() {
  const letters = "BCDFGHJKLMNPQRSTVWXYZ".split("");
  const [phase, setPhase] = useState("intro");
  const [n, setN] = useState(2);
  const [stream, setStream] = useState([]);
  const [i, setI] = useState(0);
  const [hits, setHits] = useState([]);
  const [responded, setResponded] = useState(false);
  const [tick, setTick] = useState(0);
  function makeStream() {
    const s = Array.from({ length: 24 }, () => choice(letters));
    for (let j = n; j < s.length; j += 5) s[j] = s[j - n];
    return s;
  }
  function begin() { setStream(makeStream()); setHits([]); setI(0); setTick(Date.now()); setResponded(false); setPhase("running"); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const timer = setTimeout(() => {
      const target = i >= n && stream[i] === stream[i - n];
      const nextHits = target && !responded ? [...hits, { kind: "miss" }] : hits;
      if (i >= stream.length - 1) { setHits(nextHits); setPhase("done"); } else { setHits(nextHits); setI(i + 1); setResponded(false); setTick(Date.now()); }
    }, 1400);
    return () => clearTimeout(timer);
  }, [phase, i, stream, hits, responded, n, tick]);
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      if (e.code !== "Space" || responded) return;
      e.preventDefault();
      const target = i >= n && stream[i] === stream[i - n];
      setHits([...hits, { kind: target ? "hit" : "false" }]);
      setResponded(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, i, stream, hits, responded, n]);
  const hitN = hits.filter((h) => h.kind === "hit").length;
  const missN = hits.filter((h) => h.kind === "miss").length;
  const falseN = hits.filter((h) => h.kind === "false").length;
  return (
    <GameShell cite="Kirchner, 1958" instructions={
        <ol>
          <li>Letters flash one at a time, each for about 1.4 seconds.</li>
          <li>Press <span className="kbd">Space</span> when the current letter <strong>matches the one N steps back</strong>.</li>
          <li>Set N with the slider before you begin — start with 2 if unsure.</li>
          <li>Miss = no response to a match · False alarm = response to a non-match.</li>
        </ol>
      } phase={phase} headline="keep the echo" explain="Choose N, then catch letters that match the one N steps earlier." onBegin={begin} onReset={begin} footer={phase === "intro" ? <label>N = <input type="range" min="1" max="3" value={n} onChange={(e) => setN(Number(e.target.value))} /></label> : `item ${Math.min(i + 1, stream.length || 24)}/24`} results={[{ label: "hits", value: hitN }, { label: "misses", value: missN }, { label: "false alarms", value: falseN }]} doneText="Working memory here is a moving conveyor belt: the hard part is updating without losing the comparison item.">
      <div className="center-stack">
        <div className="mono-big">{stream[i]}</div>
        <div className="progress"><i style={{ width: `${(i + 1) / stream.length * 100}%` }}></i></div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { NBack });
}
