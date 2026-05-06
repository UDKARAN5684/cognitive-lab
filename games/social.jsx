{
const { GameShell, choice, mean, shuffle, useEffect, useState } = window.GameKit;

function AschLines() {
  const [phase, setPhase] = useState("intro"), [trial, setTrial] = useState(0), [conform, setConform] = useState(0), [critical, setCritical] = useState(false);
  function begin() { setTrial(0); setConform(0); setCritical(Math.random() < 0.55); setPhase("running"); }
  const groupChoice = critical ? "C" : "B";
  function pick(opt) { const followedWrongGroup = critical && opt === groupChoice; setConform(conform + (followedWrongGroup ? 1 : 0)); if (trial >= 7) setPhase("done"); else { setTrial(trial + 1); setCritical(Math.random() < 0.55); } }
  return <GameShell cite="Asch, 1951" instructions="choose which comparison line matches the reference" phase={phase} headline="stand with the line" explain="Confederates answer first. Sometimes they unanimously choose a visibly wrong line." onBegin={begin} onReset={begin} footer={`round ${trial + 1}/8 · group says ${groupChoice}`} results={[{ label: "conformity", value: conform }, { label: "rounds", value: 8 }, { label: "group pressure", value: "visible" }]} doneText="Asch's task made social pressure measurable with nothing more dramatic than line lengths."><div className="center-stack"><svg width="420" height="190"><line x1="60" y1="40" x2="190" y2="40" stroke="#315a78" strokeWidth="5"></line>{[80,130,170].map((len, i) => <g key={i}><line x1={70 + i * 115} y1="130" x2={70 + i * 115 + len} y2="130" stroke={i === 1 ? "#9bd8f4" : "#315a78"} strokeWidth="5"></line><text x={95 + i * 115} y="165" fontFamily="JetBrains Mono">{["A","B","C"][i]}</text></g>)}</svg><div className="choice-row">{["A","B","C"].map((o) => <button className="choice-btn" key={o} onClick={() => pick(o)}>{o}</button>)}</div></div></GameShell>;
}

function IAT() {
  const words = ["joy", "peace", "love", "pain", "hate", "grief", "young", "old", "fresh", "ancient"];
  const [phase, setPhase] = useState("intro"), [block, setBlock] = useState(0), [i, setI] = useState(0), [items, setItems] = useState([]), [start, setStart] = useState(0), [rows, setRows] = useState([]);
  function begin() { setBlock(0); setI(0); setItems(shuffle(words)); setRows([]); setStart(performance.now()); setPhase("running"); }
  function side(word) { const good = ["joy","peace","love"].includes(word), young = ["young","fresh"].includes(word); return block === 0 ? (good || young ? "left" : "right") : (good || !young ? "left" : "right"); }
  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => { if (!["e","i"].includes(e.key.toLowerCase())) return; const correct = side(items[i]) === (e.key.toLowerCase() === "e" ? "left" : "right"); const next = [...rows, { block, rt: performance.now() - start + (correct ? 0 : 400) }]; if (i >= items.length - 1) { if (block === 1) { setRows(next); setPhase("done"); } else { setRows(next); setBlock(1); setItems(shuffle(words)); setI(0); setStart(performance.now()); } } else { setRows(next); setI(i + 1); setStart(performance.now()); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, block, i, items, rows, start]);
  const a = rows.filter((r) => r.block === 0).map((r) => r.rt), b = rows.filter((r) => r.block === 1).map((r) => r.rt);
  return <GameShell cite="Greenwald et al., 1998" instructions={<><span className="kbd">E</span> left <span className="kbd">I</span> right</>} phase={phase} headline="sort by pairing" explain="Category pairings change between blocks; speed becomes the dependent variable." onBegin={begin} onReset={begin} footer={`block ${block + 1}/2 · item ${i + 1}/${items.length || words.length}`} results={[{ label: "compatible", value: `${mean(a)} ms` }, { label: "incompatible", value: `${mean(b)} ms` }, { label: "D sketch", value: ((mean(b) - mean(a)) / 300).toFixed(2) }]} doneText="This toy D-score is illustrative only; IAT interpretation requires care and context."><div className="center-stack"><div className="pill-row"><span className="pill">left: {block === 0 ? "young/good" : "old/good"}</span><span className="pill">right: {block === 0 ? "old/bad" : "young/bad"}</span></div><div className="mono-big">{items[i]}</div></div></GameShell>;
}

function Trolley() {
  const qs = ["Pull a switch to divert a trolley, saving five but killing one?", "Push a person from a bridge to stop the trolley and save five?", "Divert the trolley onto a loop where one person stops it?", "Take organs from one healthy patient to save five others?"];
  const [phase, setPhase] = useState("intro"), [i, setI] = useState(0), [yes, setYes] = useState(0);
  function begin() { setI(0); setYes(0); setPhase("running"); }
  function pick(v) { setYes(yes + (v ? 1 : 0)); if (i >= qs.length - 1) setPhase("done"); else setI(i + 1); }
  return <GameShell cite="Foot, 1967" instructions="answer yes or no to each dilemma" phase={phase} headline="moral fingerprint" explain="Four scenarios vary action, contact, intention, and tradeoff." onBegin={begin} onReset={begin} footer={`scenario ${i + 1}/4`} results={[{ label: "yes", value: yes }, { label: "no", value: 4 - yes }, { label: "pattern", value: yes >= 3 ? "util" : "mixed" }]} doneText="Trolley answers are less a verdict than a contour: where action and harm start to feel different."><div className="center-stack"><p className="task-explain">{qs[i]}</p><div className="choice-row"><button className="choice-btn" onClick={() => pick(true)}>yes</button><button className="choice-btn" onClick={() => pick(false)}>no</button></div></div></GameShell>;
}

function Ultimatum() {
  const offers = [1, 2, 3, 4, 5];
  const [phase, setPhase] = useState("intro"), [i, setI] = useState(0), [accepted, setAccepted] = useState([]), [earn, setEarn] = useState(0);
  function begin() { setI(0); setAccepted([]); setEarn(0); setPhase("running"); }
  function pick(ok) { const next = [...accepted, ok]; setEarn(earn + (ok ? offers[i] : 0)); if (i >= offers.length - 1) { setAccepted(next); setPhase("done"); } else { setAccepted(next); setI(i + 1); } }
  return <GameShell cite="Güth et al., 1982" instructions="accept or reject each split of $10" phase={phase} headline="fairness has a price" explain="Rejecting an unfair offer costs you too, which is what makes the game interesting." onBegin={begin} onReset={begin} footer={`offer ${i + 1}/5`} results={[{ label: "accepted", value: accepted.filter(Boolean).length }, { label: "earned", value: `$${earn}` }, { label: "rejected", value: accepted.filter((x) => !x).length }]} doneText="Ultimatum rejections reveal that people often pay to punish unfairness."><div className="center-stack"><p className="task-explain">Computer offers you ${offers[i]} and keeps ${10 - offers[i]}.</p><div className="choice-row"><button className="choice-btn" onClick={() => pick(true)}>accept</button><button className="choice-btn" onClick={() => pick(false)}>reject</button></div></div></GameShell>;
}

function Face({ emotion }) {
  const mouth = { joy: "M35 74 Q60 96 85 74", anger: "M38 86 Q60 70 82 86", fear: "M50 78 Q60 95 70 78", sadness: "M38 88 Q60 70 82 88", surprise: "M60 76 m-11 0 a11 14 0 1 0 22 0 a11 14 0 1 0 -22 0", disgust: "M38 78 Q60 88 82 78" }[emotion];
  return <svg className="face" viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="#dcefff" stroke="#315a78"></circle><circle cx="43" cy="50" r="5"></circle><circle cx="77" cy="50" r="5"></circle><path d={mouth} fill="none" stroke="#9bd8f4" strokeWidth="5" strokeLinecap="round"></path></svg>;
}

function EmotionRecog() {
  const emotions = ["joy", "anger", "fear", "sadness", "surprise", "disgust"];
  const [phase, setPhase] = useState("intro"), [items, setItems] = useState([]), [i, setI] = useState(0), [score, setScore] = useState(0);
  function begin() { setItems(shuffle(emotions)); setI(0); setScore(0); setPhase("running"); }
  function pick(e) { const s = score + (e === items[i] ? 1 : 0); setScore(s); if (i >= items.length - 1) setPhase("done"); else setI(i + 1); }
  return <GameShell cite="Ekman & Friesen, 1976" instructions="choose the emotion shown by the face" phase={phase} headline="read the face" explain="Stylized faces stand in for the classic expression photographs." onBegin={begin} onReset={begin} footer={`face ${i + 1}/6`} results={[{ label: "score", value: `${score}/6` }, { label: "faces", value: 6 }, { label: "format", value: "SVG" }]} doneText="Emotion labels are fast guesses from features, context, and learned categories."><div className="center-stack"><Face emotion={items[i] || "joy"} /><div className="choice-row">{emotions.map((e) => <button className="choice-btn" key={e} onClick={() => pick(e)}>{e}</button>)}</div></div></GameShell>;
}

function Marshmallow() {
  const [phase, setPhase] = useState("intro"), [waiting, setWaiting] = useState(false), [left, setLeft] = useState(60), [choiceMade, setChoiceMade] = useState(""), [start, setStart] = useState(0);
  function begin() { setLeft(60); setWaiting(false); setChoiceMade(""); setPhase("running"); }
  function wait() { setWaiting(true); setStart(Date.now()); }
  useEffect(() => { if (!waiting || phase !== "running") return undefined; const t = setInterval(() => setLeft((x) => { if (x <= 1) { setChoiceMade("waited"); setPhase("done"); return 0; } return x - 1; }), 1000); return () => clearInterval(t); }, [waiting, phase]);
  function take() { setChoiceMade(waiting ? "stopped" : "now"); setPhase("done"); }
  const waited = waiting ? Math.round((Date.now() - start) / 1000) : 0;
  return <GameShell cite="Mischel, 1972" instructions="take $1 now or wait 60 seconds for $2" phase={phase} headline="one now, two later" explain="An adult-sized waiting room for delay of gratification." onBegin={begin} onReset={begin} footer={waiting ? `${left}s left` : "choice point"} results={[{ label: "choice", value: choiceMade }, { label: "waited", value: `${waited}s` }, { label: "reward", value: choiceMade === "waited" ? "$2" : "$1" }]} doneText="The famous finding became more complicated over time, but the lived task remains a study in strategy and temptation."><div className="center-stack">{waiting ? <><div className="progress"><i style={{ width: `${(60 - left) / 60 * 100}%` }}></i></div><button className="choice-btn" onClick={take}>take $1 now</button></> : <div className="choice-row"><button className="choice-btn" onClick={take}>take $1 now</button><button className="primary-btn" onClick={wait}>wait for $2</button></div>}</div></GameShell>;
}

Object.assign(window, { AschLines, IAT, Trolley, Ultimatum, EmotionRecog, Marshmallow });
}
