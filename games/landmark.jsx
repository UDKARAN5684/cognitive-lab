{
const { GameShell, mean, now, useEffect, useState } = window.GameKit;

// Offsets as fraction of half-line-length (-1 = far left, 0 = center, +1 = far right)
// Positive = mark is right of true center (correct answer: "right")
// Negative = mark is left of true center (correct answer: "left")
function makeTrials(n = 24) {
  const offsets = [];
  const steps = [-0.6, -0.4, -0.25, -0.12, 0.12, 0.25, 0.4, 0.6];
  for (let i = 0; i < n; i++) offsets.push(steps[i % steps.length]);
  // shuffle
  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  return offsets;
}

function Landmark() {
  const [phase, setPhase]   = useState("intro");
  const [trials, setTrials] = useState([]);
  const [idx, setIdx]       = useState(0);
  const [rows, setRows]     = useState([]);
  const [started, setStarted] = useState(0);
  const [feedback, setFeedback] = useState(null); // "ok" | "err"

  function begin() {
    const t = makeTrials(24);
    setTrials(t); setIdx(0); setRows([]);
    setFeedback(null); setStarted(now());
    setPhase("running");
  }

  async function respond(answer) {
    if (phase !== "running" || feedback) return;
    const offset   = trials[idx];
    const correct  = offset > 0 ? "right" : "left";
    const ok       = answer === correct;
    const rt       = now() - started;
    const fb       = ok ? "ok" : "err";
    setFeedback(fb);

    await new Promise((r) => setTimeout(r, 350));
    setFeedback(null);

    const next = [...rows, { offset, ok, rt, answer }];
    if (idx + 1 >= trials.length) {
      setRows(next);
      setPhase("done");
    } else {
      setRows(next);
      setIdx(idx + 1);
      setStarted(now());
    }
  }

  useEffect(() => {
    if (phase !== "running") return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  respond("left");
      if (e.key === "ArrowRight") respond("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, idx, rows, feedback, started, trials]);

  // Results
  const acc = rows.length ? Math.round(rows.filter((r) => r.ok).length / rows.length * 100) : 0;
  // Pseudoneglect: left-bias means people judge centre as slightly right of true centre
  const leftBias = rows.filter((r) => r.answer === "left").length;
  const bias = rows.length
    ? (leftBias / rows.length > 0.5 ? "left bias" : leftBias / rows.length < 0.5 ? "right bias" : "neutral")
    : "—";
  const rt = mean(rows.map((r) => r.rt));

  // Visual: line spans from 10% to 90% of viewBox width (viewBox 400×120)
  const LINE_L = 40, LINE_R = 360, LINE_MID = 200;
  const halfSpan = LINE_R - LINE_MID; // 160
  const offset = trials[idx] ?? 0;
  const markX = LINE_MID + offset * halfSpan;

  return (
    <GameShell
      cite="Harvey et al., 1995"
      instructions={
        <ol>
          <li>A horizontal line appears with a small vertical tick mark cutting through it.</li>
          <li>Judge whether the tick is <strong>left</strong> or <strong>right</strong> of the line's true centre.</li>
          <li>Press <strong>← Left</strong> or <strong>→ Right</strong> arrow key — or tap the buttons below.</li>
          <li>Answer quickly; 24 trials in total.</li>
          <li>Your bias score reveals the classic <em>pseudoneglect</em> effect.</li>
        </ol>
      }
      phase={phase}
      headline="find the centre"
      explain="A bisecting mark appears on a line. Judge whether it sits left or right of true centre."
      onBegin={begin}
      onReset={begin}
      footer={`trial ${Math.min(idx + 1, trials.length || 24)}/24`}
      results={[
        { label: "accuracy",  value: `${acc}%` },
        { label: "mean RT",   value: `${rt} ms` },
        { label: "response bias", value: bias },
      ]}
      doneText="Most people show a slight left bias (pseudoneglect): the right hemisphere slightly over-represents left space."
    >
      <div className="landmark-board">
        <svg
          className="landmark-svg"
          viewBox="0 0 400 120"
          aria-label="line bisection stimulus"
        >
          {/* Main horizontal line */}
          <line
            x1={LINE_L} y1="60" x2={LINE_R} y2="60"
            stroke={feedback === "ok" ? "#16A34A" : feedback === "err" ? "#EF4444" : "#1E3A5F"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Bisecting tick mark */}
          <line
            x1={markX} y1="36" x2={markX} y2="84"
            stroke={feedback === "ok" ? "#16A34A" : feedback === "err" ? "#EF4444" : "#1E3A5F"}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="landmark-btns">
          <button
            className={`choice-btn landmark-choice${feedback === "ok" && trials[idx] < 0 ? " ok" : feedback === "err" && trials[idx] >= 0 ? " err" : ""}`}
            onClick={() => respond("left")}
          >
            ← Left
          </button>
          <button
            className={`choice-btn landmark-choice${feedback === "ok" && trials[idx] > 0 ? " ok" : feedback === "err" && trials[idx] <= 0 ? " err" : ""}`}
            onClick={() => respond("right")}
          >
            Right →
          </button>
        </div>
      </div>
    </GameShell>
  );
}

Object.assign(window, { Landmark });
}
