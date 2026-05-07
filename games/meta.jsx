{
const { GameShell, mean, useState } = window.GameKit;

function LindaProblem() {
  const [phase, setPhase] = useState("intro"), [choice, setChoice] = useState("");
  function begin() { setChoice(""); setPhase("running"); }
  return <GameShell cite="Tversky & Kahneman, 1983" instructions={
        <ol>
          <li>Read the description of Linda carefully.</li>
          <li>Choose which of the two statements is <strong>more probable</strong>.</li>
          <li>Think statistically — not just which statement fits her personality better.</li>
          <li>One choice — consider the conjunction rule before you answer.</li>
        </ol>
      } phase={phase} headline="meet Linda" explain="A vivid description can make a narrower claim feel more likely." onBegin={begin} onReset={begin} footer="probability, not resemblance" results={[{ label: "choice", value: choice }, { label: "normative", value: "teller" }, { label: "fallacy", value: choice === "both" ? "yes" : "no" }]} doneText="A conjunction cannot be more probable than one of its parts, even when the story fits beautifully."><div className="center-stack"><p className="task-explain">Linda is 31, single, outspoken, and bright. She majored in philosophy and was deeply concerned with discrimination and social justice.</p><button className="choice-btn" onClick={() => { setChoice("teller"); setPhase("done"); }}>Linda is a bank teller</button><button className="choice-btn" onClick={() => { setChoice("both"); setPhase("done"); }}>Linda is a bank teller and active in the feminist movement</button></div></GameShell>;
}

function CRT() {
  const qs = [
    ["A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much is the ball?", "5"],
    ["5 machines make 5 widgets in 5 minutes. How long for 100 machines to make 100 widgets?", "5"],
    ["A lily pad patch doubles daily. If it covers the lake in 48 days, when did it cover half?", "47"]
  ];
  const [phase, setPhase] = useState("intro"), [i, setI] = useState(0), [ans, setAns] = useState(""), [score, setScore] = useState(0);
  function begin() { setI(0); setAns(""); setScore(0); setPhase("running"); }
  function submit() { const ok = ans.trim().replace("$", "") === qs[i][1]; const s = score + (ok ? 1 : 0); setScore(s); setAns(""); if (i >= qs.length - 1) setPhase("done"); else setI(i + 1); }
  return <GameShell cite="Frederick, 2005" instructions={
        <ol>
          <li>Three word problems appear one at a time.</li>
          <li>Each has an intuitive-sounding wrong answer — <strong>resist the first answer that comes to mind</strong>.</li>
          <li>Type the correct numerical answer and submit.</li>
          <li>3 items total — slow down and verify your reasoning before submitting.</li>
        </ol>
      } phase={phase} headline="pause the first answer" explain="Each item has an intuitive lure. The trick is noticing the lure." onBegin={begin} onReset={begin} footer={`item ${i + 1}/3`} results={[{ label: "score", value: `${score}/3` }, { label: "items", value: 3 }, { label: "mode", value: "typed" }]} doneText="CRT performance reflects the habit of checking fluent answers before endorsing them."><div className="center-stack"><p className="task-explain">{qs[i][0]}</p><input className="text-input" value={ans} onChange={(e) => setAns(e.target.value)} /><button className="primary-btn" onClick={submit}>submit →</button></div></GameShell>;
}

function BigFive() {
  const items = [["reserved", "E", -1], ["trusting", "A", 1], ["lazy", "C", -1], ["relaxed", "N", -1], ["artistic", "O", 1], ["outgoing", "E", 1], ["fault-finding", "A", -1], ["thorough", "C", 1], ["nervous", "N", 1], ["imaginative", "O", 1]];
  const [phase, setPhase] = useState("intro"), [i, setI] = useState(0), [scores, setScores] = useState({ O: [], C: [], E: [], A: [], N: [] });
  function begin() { setI(0); setScores({ O: [], C: [], E: [], A: [], N: [] }); setPhase("running"); }
  function rate(v) { const [text, trait, dir] = items[i]; const val = dir > 0 ? v : 6 - v; const next = { ...scores, [trait]: [...scores[trait], val] }; setScores(next); if (i >= items.length - 1) setPhase("done"); else setI(i + 1); }
  const vals = ["O","C","E","A","N"].map((k) => mean(scores[k]));
  const pts = vals.map((v, idx) => { const a = -Math.PI / 2 + idx / 5 * Math.PI * 2; const r = (v || 1) / 5 * 95; return `${140 + Math.cos(a) * r},${125 + Math.sin(a) * r}`; }).join(" ");
  const radar = <svg className="radar" viewBox="0 0 280 250"><polygon points="140,30 230,95 195,210 85,210 50,95" fill="none" stroke="#b8d8ef"></polygon><polygon points={pts} fill="rgba(155,216,244,0.32)" stroke="#9bd8f4"></polygon>{["O","C","E","A","N"].map((l, idx) => { const a = -Math.PI / 2 + idx / 5 * Math.PI * 2; return <text key={l} x={140 + Math.cos(a) * 112} y={128 + Math.sin(a) * 112} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="12">{l}</text>; })}</svg>;
  return <GameShell cite="Rammstedt & John, 2007" instructions={
        <ol>
          <li>Ten short personality statements appear one at a time.</li>
          <li>Rate how well each describes you from <strong>1 (disagree)</strong> to <strong>5 (agree)</strong>.</li>
          <li>Answer instinctively — there are no right or wrong responses.</li>
          <li>Your ratings generate a rough Big Five personality sketch.</li>
        </ol>
      } phase={phase} headline="ten-item portrait" explain="A tiny Big Five sketch, useful for curiosity rather than clinical interpretation." onBegin={begin} onReset={begin} footer={`item ${i + 1}/10`} results={[{ label: "O", value: vals[0] || 0 }, { label: "C", value: vals[1] || 0 }, { label: "E/A/N", value: `${vals[2] || 0}/${vals[3] || 0}/${vals[4] || 0}` }]} doneText="The BFI-10 is intentionally brief: a thumbnail, not a full personality inventory." doneExtra={radar}><div className="center-stack"><p className="task-explain">I see myself as someone who is {items[i][0]}.</p><div className="choice-row">{[1,2,3,4,5].map((v) => <button className="choice-btn" key={v} onClick={() => rate(v)}>{v}</button>)}</div></div></GameShell>;
}

Object.assign(window, { LindaProblem, CRT, BigFive });
}
