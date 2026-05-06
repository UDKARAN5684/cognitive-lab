{
const { GameShell, rand, useEffect, useState } = window.GameKit;

function MullerLyer() {
  const [phase, setPhase] = useState("intro"), [v, setV] = useState(160);
  function begin() { setV(160); setPhase("running"); }
  return (
    <GameShell cite="Müller-Lyer, 1889" instructions="adjust the lower line until it appears equal" phase={phase} headline="measure what you see" explain="Arrowheads pull perceived length away from physical length." onBegin={begin} onReset={begin} footer={`adjusted length ${v}px`} results={[{ label: "true top", value: "180 px" }, { label: "your match", value: `${v} px` }, { label: "bias", value: `${v - 180} px` }]} doneText="The illusion is the gap between the slider's number and the line your eyes believed." >
      <div className="center-stack">
        <svg width="520" height="190" viewBox="0 0 520 190"><line x1="170" y1="55" x2="350" y2="55" stroke="#315a78" strokeWidth="4"></line><path d="M170 55 l28 -22 M170 55 l28 22 M350 55 l-28 -22 M350 55 l-28 22" stroke="#315a78" strokeWidth="4"></path><line x1={260 - v / 2} y1="125" x2={260 + v / 2} y2="125" stroke="#9bd8f4" strokeWidth="4"></line><path d={`M${260 - v / 2} 125 l-28 -22 M${260 - v / 2} 125 l-28 22 M${260 + v / 2} 125 l28 -22 M${260 + v / 2} 125 l28 22`} stroke="#9bd8f4" strokeWidth="4"></path></svg>
        <div className="range-wrap"><input type="range" min="120" max="240" value={v} onChange={(e) => setV(Number(e.target.value))} /><button className="primary-btn" onClick={() => setPhase("done")}>lock answer →</button></div>
      </div>
    </GameShell>
  );
}

function Ebbinghaus() {
  const [phase, setPhase] = useState("intro"), [v, setV] = useState(46);
  function begin() { setV(46); setPhase("running"); }
  const ring = (big, cx) => Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; const r = big ? 82 : 54; return <circle key={i} cx={cx + Math.cos(a) * r} cy={100 + Math.sin(a) * r} r={big ? 28 : 14} fill="none" stroke="#b8d8ef"></circle>; });
  return (
    <GameShell cite="Ebbinghaus, 1902" instructions="adjust the right centre circle to match the left one" phase={phase} headline="context has gravity" explain="Identical centres can feel different when their neighbours change scale." onBegin={begin} onReset={begin} footer={`match diameter ${v}px`} results={[{ label: "target", value: "52 px" }, { label: "match", value: `${v} px` }, { label: "bias", value: `${v - 52} px` }]} doneText="Surrounding circles shift the felt size of the centre, even when you know the trick.">
      <div className="center-stack"><svg width="560" height="210" viewBox="0 0 560 210">{ring(true, 160)}{ring(false, 400)}<circle cx="160" cy="100" r="26" fill="#9bd8f4"></circle><circle cx="400" cy="100" r={v / 2} fill="#9bd8f4"></circle></svg><input type="range" min="30" max="74" value={v} onChange={(e) => setV(Number(e.target.value))} /><button className="primary-btn" onClick={() => setPhase("done")}>lock answer →</button></div>
    </GameShell>
  );
}

function ChangeBlindness() {
  const [phase, setPhase] = useState("intro"), [flip, setFlip] = useState(false), [found, setFound] = useState(false), [start, setStart] = useState(0), [rt, setRt] = useState(0);
  function begin() { setFound(false); setRt(0); setStart(performance.now()); setPhase("running"); }
  useEffect(() => { if (phase !== "running") return undefined; const t = setInterval(() => setFlip((f) => !f), 450); return () => clearInterval(t); }, [phase]);
  function click(name) { if (name === "clock") { setFound(true); setRt(performance.now() - start); setPhase("done"); } }
  const item = (name, x, y, color) => <button onClick={() => click(name)} style={{ position: "absolute", left: x, top: y, width: 46, height: 46, background: color, border: "1px solid #315a78" }} aria-label={name}></button>;
  return (
    <GameShell cite="Rensink et al., 1997" instructions="click the item that changes across the flicker" phase={phase} headline="what vanished?" explain="A blank blink interrupts the scene, and one ordinary object changes." onBegin={begin} onReset={begin} footer={found ? "change found" : "flickering scene"} results={[{ label: "found", value: found ? "yes" : "no" }, { label: "time", value: `${Math.round(rt)} ms` }, { label: "change", value: "clock" }]} doneText="Change blindness appears when attention has not indexed the changing object.">
      <div style={{ position: "relative", width: 520, height: 260, background: "#f3fbff", border: "1px solid #b8d8ef" }}>{flip && <div style={{ position: "absolute", inset: 0, background: "#dcefff", zIndex: 3 }}></div>}{item("book", 90, 72, "#a9cfff")}{item("plant", 300, 150, "#7fbce6")}{item("clock", 370, 55, flip ? "#f3fbff" : "#9bd8f4")}{item("cup", 200, 120, "#c5deff")}</div>
    </GameShell>
  );
}

Object.assign(window, { MullerLyer, Ebbinghaus, ChangeBlindness });
}
