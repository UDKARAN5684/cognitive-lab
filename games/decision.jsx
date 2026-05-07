{
const { GameShell, choice, mean, rand, useState } = window.GameKit;

function Anchoring() {
  const [phase, setPhase] = useState("intro"), [anchor, setAnchor] = useState(0), [step, setStep] = useState(0), [above, setAbove] = useState(null), [estimate, setEstimate] = useState("");
  function begin() { setAnchor(choice([18, 85])); setStep(0); setAbove(null); setEstimate(""); setPhase("running"); }
  function done() { setPhase("done"); }
  return <GameShell cite="Tversky & Kahneman, 1974" instructions={
        <ol>
          <li>A number — the <strong>anchor</strong> — is shown to you.</li>
          <li>First judge whether Turkey's population is above or below it.</li>
          <li>Then give your best estimate of the population in millions.</li>
          <li>One trial — the anchor is randomly high or low to test its pull on your guess.</li>
        </ol>
      } phase={phase} headline="the number sticks" explain="A high or low anchor arrives first, then your estimate follows it." onBegin={begin} onReset={begin} footer={`anchor ${anchor} million`} results={[{ label: "anchor", value: `${anchor}m` }, { label: "estimate", value: `${estimate || 0}m` }, { label: "direction", value: above ? "above" : "below" }]} doneText="Anchoring is influence without persuasion: the initial value changes the adjustment path.">{step === 0 ? <div className="center-stack"><p className="task-explain">Is Turkey's population above or below {anchor} million?</p><div className="choice-row"><button className="choice-btn" onClick={() => { setAbove(true); setStep(1); }}>above</button><button className="choice-btn" onClick={() => { setAbove(false); setStep(1); }}>below</button></div></div> : <div className="center-stack"><p className="task-explain">Now estimate the population in millions.</p><input className="text-input" value={estimate} onChange={(e) => setEstimate(e.target.value)} /><button className="primary-btn" onClick={done}>reveal →</button></div>}</GameShell>;
}

function Framing() {
  const [phase, setPhase] = useState("intro"), [gain, setGain] = useState(true), [risk, setRisk] = useState("");
  function begin() { setGain(Math.random() > 0.5); setRisk(""); setPhase("running"); }
  return <GameShell cite="Tversky & Kahneman, 1981" instructions={
        <ol>
          <li>A public-health scenario is described.</li>
          <li>Read the two programs carefully, then choose one.</li>
          <li>There is no right answer — your gut reaction is the data.</li>
          <li>One choice — notice whether the wording pushed you toward risk or certainty.</li>
        </ol>
      } phase={phase} headline="same math, new coat" explain="The Asian Disease problem changes wording while expected values stay aligned." onBegin={begin} onReset={begin} footer={gain ? "gain frame" : "loss frame"} results={[{ label: "frame", value: gain ? "gain" : "loss" }, { label: "choice", value: risk }, { label: "risk", value: risk === "risky" ? "yes" : "no" }]} doneText="Framing effects show that preferences can depend on whether outcomes are cast as lives saved or lives lost."><div className="center-stack"><p className="task-explain">{gain ? "Program A will save 200 people. Program B has a 1/3 chance of saving 600 and 2/3 chance of saving none." : "Program A means 400 people will die. Program B has a 1/3 chance nobody dies and 2/3 chance 600 die."}</p><div className="choice-row"><button className="choice-btn" onClick={() => { setRisk("sure"); setPhase("done"); }}>choose A</button><button className="choice-btn" onClick={() => { setRisk("risky"); setPhase("done"); }}>choose B</button></div></div></GameShell>;
}

function DelayDiscounting() {
  const [phase, setPhase] = useState("intro"), [i, setI] = useState(0), [rows, setRows] = useState([]);
  const opts = Array.from({ length: 10 }, (_, n) => ({ now: 20 + n * 4, later: 50 + n * 6, days: [7, 14, 30, 60, 90][n % 5] }));
  function begin() { setI(0); setRows([]); setPhase("running"); }
  function pick(later) { const next = [...rows, later]; if (i >= opts.length - 1) { setRows(next); setPhase("done"); } else { setRows(next); setI(i + 1); } }
  const laterCount = rows.filter(Boolean).length;
  return <GameShell cite="Mazur, 1987" instructions={
        <ol>
          <li>Each trial offers a choice: a <strong>smaller amount now</strong> or a <strong>larger amount later</strong>.</li>
          <li>Choose whichever option you would genuinely prefer.</li>
          <li>10 choices total — amounts and delays vary across trials.</li>
          <li>Your pattern reveals how steeply you discount future rewards.</li>
        </ol>
      } phase={phase} headline="future money" explain="Each choice trades immediacy against amount." onBegin={begin} onReset={begin} footer={`choice ${i + 1}/10`} results={[{ label: "later choices", value: `${laterCount}/10` }, { label: "now choices", value: `${rows.length - laterCount}/10` }, { label: "k sketch", value: (1 / Math.max(1, laterCount)).toFixed(2) }]} doneText="This demo's k is a sketch: fewer later choices imply steeper discounting of delayed rewards."><div className="choice-row"><button className="choice-btn" onClick={() => pick(false)}>${opts[i]?.now} now</button><button className="choice-btn" onClick={() => pick(true)}>${opts[i]?.later} in {opts[i]?.days} days</button></div></GameShell>;
}

function IowaGambling() {
  const decks = { A: [100, -250], B: [100, -1250], C: [50, -50], D: [50, -250] };
  const [phase, setPhase] = useState("intro"), [cash, setCash] = useState(2000), [picks, setPicks] = useState([]), [last, setLast] = useState("");
  function begin() { setCash(2000); setPicks([]); setLast(""); setPhase("running"); }
  function pick(d) { const loss = Math.random() < (d < "C" ? 0.25 : 0.12) ? decks[d][1] : 0; const gain = decks[d][0]; const nextCash = cash + gain + loss; const next = [...picks, d]; setCash(nextCash); setLast(`${d}: ${gain + loss}`); if (next.length >= 60) { setPicks(next); setPhase("done"); } else setPicks(next); }
  return <GameShell cite="Bechara et al., 1994" instructions={
        <ol>
          <li>Four decks (A, B, C, D) are available — you start with $2,000.</li>
          <li><strong>Click a deck</strong> each turn to draw a card and see your gain or loss.</li>
          <li>Some decks pay more per draw but carry larger hidden penalties.</li>
          <li>60 draws total — learn which decks maximise your final balance.</li>
        </ol>
      } phase={phase} headline="learn the decks" explain="A and B pay more, but their punishments can be severe." onBegin={begin} onReset={begin} footer={`${picks.length}/60 · cash $${cash} · ${last}`} results={[{ label: "cash", value: `$${cash}` }, { label: "good decks", value: picks.filter((d) => d === "C" || d === "D").length }, { label: "bad decks", value: picks.filter((d) => d === "A" || d === "B").length }]} doneText="The Iowa task asks whether reward history can teach you to prefer the modest decks."><div className="choice-row">{Object.keys(decks).map((d) => <button key={d} className="choice-btn" onClick={() => pick(d)}>deck {d}</button>)}</div></GameShell>;
}

Object.assign(window, { Anchoring, Framing, DelayDiscounting, IowaGambling });
}
