{
const { GameShell, choice, mean, shuffle, useEffect, useState } = window.GameKit;

function LexicalDecision() {
  const pairs = [["DOCTOR", "NURSE", true], ["BREAD", "NURSE", true], ["CHAIR", "TABLE", true], ["CLOUD", "TRANDLE", false], ["MUSIC", "PIANO", true], ["STONE", "MAVENK", false], ["DOG", "CAT", true], ["RIVER", "BANTER", true]];
  const [phase, setPhase] = useState("intro"), [items, setItems] = useState([]), [i, setI] = useState(0), [prime, setPrime] = useState(true), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function next(n = 0) { setI(n); setPrime(true); setTimeout(() => { setPrime(false); setStart(performance.now()); }, 500); }
  function begin() { setItems(shuffle(pairs)); setRows([]); setPhase("running"); next(0); }
  useEffect(() => {
    if (phase !== "running" || prime) return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase(); if (!["w", "n"].includes(k)) return;
      const item = items[i]; const ok = (k === "w") === item[2]; const related = (item[0] === "DOCTOR" && item[1] === "NURSE") || (item[0] === "CHAIR" && item[1] === "TABLE") || (item[0] === "MUSIC" && item[1] === "PIANO") || (item[0] === "DOG" && item[1] === "CAT");
      const nextRows = [...rows, { ok, rt: performance.now() - start, related }];
      if (i >= items.length - 1) { setRows(nextRows); setPhase("done"); } else { setRows(nextRows); next(i + 1); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, prime, items, i, rows, start]);
  return <GameShell cite="Meyer & Schvaneveldt, 1971" instructions={
        <ol>
          <li>A prime word flashes briefly, then a target string appears.</li>
          <li>Decide: is the target a <strong>real English word</strong> or a made-up string?</li>
          <li>Press <span className="kbd">W</span> for a real word · <span className="kbd">N</span> for a non-word.</li>
          <li>8 items — semantically related primes should speed responses to real words.</li>
        </ol>
      } phase={phase} headline="meaning warms up" explain="A prime appears briefly, then a target asks word or non-word." onBegin={begin} onReset={begin} footer={`item ${i + 1}/${items.length || pairs.length}`} results={[{ label: "accuracy", value: `${Math.round(rows.filter((r) => r.ok).length / Math.max(1, rows.length) * 100)}%` }, { label: "related", value: `${mean(rows.filter((r) => r.related).map((r) => r.rt))} ms` }, { label: "unrelated", value: `${mean(rows.filter((r) => !r.related).map((r) => r.rt))} ms` }]} doneText="Semantic priming is the speed advantage when meaning has already opened the right drawer."><div className="center-stack"><span className="pill">{prime ? "prime" : "target"}</span><div className="mono-big">{prime ? items[i]?.[0] : items[i]?.[1]}</div></div></GameShell>;
}

function MereExposure() {
  const shapes = ["M20 10 L90 35 L65 100 L12 84 Z", "M50 8 L96 78 L25 95 Z", "M12 20 L85 10 L100 70 L42 105 Z", "M55 8 L105 55 L70 108 L10 75 Z"];
  const freq = [1, 5, 10, 25];
  const [phase, setPhase] = useState("intro"), [study, setStudy] = useState([]), [i, setI] = useState(0), [ratings, setRatings] = useState([]);
  function begin() { const s = shuffle(shapes.flatMap((p, idx) => Array.from({ length: freq[idx] }, () => idx))); setStudy(s); setI(0); setRatings([]); setPhase("running"); }
  function rate(v) {
    const testIdx = i - study.length;
    const next = [...ratings, { shape: testIdx, rating: v }];
    setRatings(next);
    if (testIdx >= shapes.length - 1) setPhase("done");
    else setI(i + 1);
  }
  useEffect(() => { if (phase !== "running" || i >= study.length) return undefined; const t = setTimeout(() => setI(i + 1), 120); return () => clearTimeout(t); }, [phase, i, study]);
  const testing = phase === "running" && i >= study.length; const testIdx = i - study.length;
  const vals = freq.map((f, idx) => ratings.find((r) => r.shape === idx)?.rating || 0);
  return <GameShell cite="Zajonc, 1968" instructions={
        <ol>
          <li>Abstract shapes flash briefly in sequence — just watch, no response needed yet.</li>
          <li>Some shapes appear more often than others during the exposure phase.</li>
          <li>After the exposure, each shape appears once — <strong>rate how much you like it</strong> from 1 to 7.</li>
          <li>Your ratings reveal whether frequency alone boosted preference.</li>
        </ol>
      } phase={phase} headline="familiar becomes fluent" explain="Some polygons appear more often than others. Later, rate how much you like each." onBegin={begin} onReset={begin} footer={testing ? `rating ${testIdx + 1}/4` : `exposure ${i + 1}/${study.length || 41}`} results={[{ label: "freq 1", value: vals[0] }, { label: "freq 10", value: vals[2] }, { label: "freq 25", value: vals[3] }]} doneText="Mere exposure often raises preference without any explicit argument for the object."><div className="center-stack">{testing ? <><svg width="130" height="130" viewBox="0 0 120 120"><path d={shapes[testIdx]} fill="#9bd8f4" stroke="#315a78"></path></svg><div className="choice-row">{[1,2,3,4,5,6,7].map((v) => <button className="choice-btn" key={v} onClick={() => rate(v)}>{v}</button>)}</div></> : <svg width="130" height="130" viewBox="0 0 120 120"><path d={shapes[study[i] || 0]} fill="#315a78" stroke="#315a78"></path></svg>}</div></GameShell>;
}

Object.assign(window, { LexicalDecision, MereExposure });
}
