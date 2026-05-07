{
const { GameShell, choice, useEffect, useRef, useState } = window.GameKit;

const PADS = [
  { id: "r", label: "Red",    bg: "#EF4444", flash: "#FCA5A5", key: "1" },
  { id: "g", label: "Green",  bg: "#16A34A", flash: "#86EFAC", key: "2" },
  { id: "b", label: "Blue",   bg: "#2563EB", flash: "#93C5FD", key: "3" },
  { id: "y", label: "Yellow", bg: "#D97706", flash: "#FCD34D", key: "4" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function Simon() {
  const [phase, setPhase]       = useState("intro");
  const [seq, setSeq]           = useState([]);
  const [pos, setPos]           = useState(0);
  const [lit, setLit]           = useState(null);
  const [showing, setShowing]   = useState(false);
  const [wrong, setWrong]       = useState(false);
  const [maxLevel, setMaxLevel] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const cancelledRef = useRef(false);
  const seqRef       = useRef([]);

  async function showSequence(sequence) {
    setShowing(true);
    setPos(0);
    const delay = Math.max(300, 600 - sequence.length * 20);
    await sleep(500);
    for (const id of sequence) {
      if (cancelledRef.current) return;
      setLit(id);
      await sleep(delay);
      if (cancelledRef.current) return;
      setLit(null);
      await sleep(200);
    }
    setShowing(false);
  }

  async function nextRound(prevSeq) {
    const next = [...prevSeq, choice(PADS).id];
    seqRef.current = next;
    setSeq(next);
    setMaxLevel((m) => Math.max(m, next.length));
    await showSequence(next);
  }

  function begin() {
    cancelledRef.current = false;
    setSeq([]); setPos(0); setLit(null);
    setShowing(false); setWrong(false);
    setMaxLevel(0); setMistakes(0);
    setPhase("running");
    nextRound([]);
  }

  async function handlePress(id) {
    if (showing || phase !== "running") return;
    const current = seqRef.current;
    setLit(id);
    await sleep(150);
    setLit(null);

    if (id !== current[pos]) {
      setWrong(true);
      setMistakes((m) => m + 1);
      await sleep(600);
      setWrong(false);
      setPos(0);
      await nextRound(current);
      return;
    }

    const nextPos = pos + 1;
    if (nextPos >= current.length) {
      if (current.length >= 20) {
        setPhase("done");
        return;
      }
      setPos(0);
      await sleep(700);
      await nextRound(current);
    } else {
      setPos(nextPos);
    }
  }

  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      const pad = PADS.find((p) => p.key === e.key);
      if (pad) handlePress(pad.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, showing, pos, seq]);

  useEffect(() => () => { cancelledRef.current = true; }, []);

  const level = seq.length;

  return (
    <GameShell
      cite="Sequential span · 1978"
      instructions={
        <ol>
          <li>Watch the coloured pads flash in sequence.</li>
          <li>Repeat the pattern by tapping (or pressing <strong>1 2 3 4</strong>) in the same order.</li>
          <li>Each correct round adds one more step to the sequence.</li>
          <li>A wrong tap replays the same sequence — try again.</li>
          <li>Reach level 20 to finish, or see how far you can go.</li>
        </ol>
      }
      phase={phase}
      headline="repeat the pattern"
      explain="Watch the sequence, then tap it back. Each round it grows by one."
      onBegin={begin}
      onReset={begin}
      footer={phase === "running" ? `level ${level} · step ${pos + 1}/${level}${showing ? " · watch…" : ""}` : ""}
      results={[
        { label: "level reached", value: maxLevel },
        { label: "mistakes",      value: mistakes },
        { label: "perfect run",   value: mistakes === 0 ? "yes" : "no" },
      ]}
      doneText="Simon tests how many items working memory can hold and replay in order."
    >
      <div className={`simon-board${wrong ? " wrong" : ""}`}>
        <div className="simon-grid">
          {PADS.map((pad) => {
            const isLit = lit === pad.id;
            return (
              <button
                key={pad.id}
                className={`simon-pad${isLit ? " lit" : ""}${showing ? " no-hover" : ""}`}
                style={{
                  "--pad-bg":    pad.bg,
                  "--pad-flash": pad.flash,
                }}
                onClick={() => handlePress(pad.id)}
                aria-label={pad.label}
                disabled={showing}
              >
                <span className="simon-key">{pad.key}</span>
              </button>
            );
          })}
        </div>
        {phase === "running" && (
          <p className="simon-status">
            {showing ? "watch the sequence…" : "your turn — repeat it"}
          </p>
        )}
      </div>
    </GameShell>
  );
}

Object.assign(window, { Simon });
}
