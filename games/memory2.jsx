{
const { GameShell, shuffle, useEffect, useRef, useState } = window.GameKit;

/* ── False Memory — DRM paradigm ───────────────────────────────────── */
function FalseMemory() {
  const [phase, setPhase]     = useState("intro");
  const [current, setCurrent] = useState("");
  const [testPhase, setTestPhase] = useState(false);
  const [testIdx, setTestIdx] = useState(0);
  const [rows, setRows]       = useState([]);
  const timerRef = useRef(null);

  // Sleep-associated word list; critical lure = "sleep" (never shown)
  const studyWords = ["bed","rest","awake","tired","dream","wake","night","blanket","doze","snore","pillow","yawn"];
  const testItems  = shuffle([
    { word: "sleep",  type: "lure"       },
    { word: "bed",    type: "studied"    },
    { word: "pillow", type: "studied"    },
    { word: "table",  type: "distractor" },
    { word: "dream",  type: "studied"    },
    { word: "chair",  type: "distractor" },
  ]);

  function begin() {
    setRows([]); setTestPhase(false); setTestIdx(0);
    setPhase("running");
    let i = 0;
    function show() {
      if (i < studyWords.length) {
        setCurrent(studyWords[i++]);
        timerRef.current = setTimeout(show, 1100);
      } else {
        setCurrent("✓ now testing your memory…");
        timerRef.current = setTimeout(() => { setCurrent(""); setTestPhase(true); }, 1800);
      }
    }
    show();
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function answer(recognized) {
    const item = testItems[testIdx];
    const nr   = [...rows, { ...item, recognized }];
    setRows(nr);
    if (testIdx >= testItems.length - 1) setPhase("done");
    else setTestIdx(testIdx + 1);
  }

  const lureRow    = rows.find(r => r.type === "lure");
  const hits       = rows.filter(r => r.type === "studied"    && r.recognized).length;
  const studied    = rows.filter(r => r.type === "studied").length;
  const falseAlarm = rows.filter(r => (r.type === "lure" || r.type === "distractor") && r.recognized).length;

  return (
    <GameShell
      cite="Roediger & McDermott, 1995"
      instructions={<ol>
        <li>12 words will appear one at a time — study them carefully.</li>
        <li>After a short pause, you'll be tested on 6 words.</li>
        <li>For each test word, say whether it appeared in the original list.</li>
        <li>One of the test words is a trap — it was never shown, but will feel familiar.</li>
      </ol>}
      phase={phase} headline="spot the impostor"
      explain="A word that was never shown can feel like it was — your brain fills in what belongs."
      onBegin={begin} onReset={begin}
      footer={testPhase ? `test word ${testIdx + 1}/${testItems.length}` : "study phase — read carefully"}
      results={[
        { label: "real words recalled",  value: `${hits}/${studied}` },
        { label: "false memory planted", value: lureRow ? (lureRow.recognized ? "yes — caught you!" : "no — you resisted") : "—" },
        { label: "total false alarms",   value: falseAlarm }
      ]}
      doneText="The DRM effect: related word lists plant a vivid false memory for the central theme word — even though it was never there."
    >
      <div className="center-stack">
        {!testPhase ? (
          <div className="mono-big" style={{ minWidth: 220, textAlign: "center" }}>{current}</div>
        ) : (
          <>
            <p className="task-explain">
              Was <strong style={{ fontSize: "1.4em", color: "var(--blue)" }}>{testItems[testIdx]?.word}</strong> in the original list?
            </p>
            <div className="choice-row">
              <button className="choice-btn" onClick={() => answer(true)}>Yes — I saw it</button>
              <button className="choice-btn" onClick={() => answer(false)}>No — not in the list</button>
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}

/* ── Source Monitoring — where did you see that? ────────────────────── */
function SourceMonitoring() {
  const items = [
    { word: "piano",   source: "A", shown: true  },
    { word: "saturn",  source: "B", shown: true  },
    { word: "lantern", source: "A", shown: true  },
    { word: "crimson", source: "B", shown: true  },
    { word: "mosaic",  source: "A", shown: true  },
    { word: "ferret",  source: "B", shown: true  },
  ];
  const testWords = shuffle([
    ...items,
    { word: "anchor",  source: null, shown: false },
    { word: "velvet",  source: null, shown: false },
  ]);

  const [phase, setPhase]   = useState("intro");
  const [studyIdx, setStudyIdx] = useState(0);
  const [testIdx, setTestIdx]   = useState(0);
  const [studyDone, setStudyDone] = useState(false);
  const [rows, setRows]     = useState([]);
  const timerRef = useRef(null);

  function begin() {
    setStudyIdx(0); setTestIdx(0); setStudyDone(false); setRows([]);
    setPhase("running");
    showStudy(0);
  }

  function showStudy(i) {
    if (i >= items.length) { setStudyDone(true); return; }
    setStudyIdx(i);
    timerRef.current = setTimeout(() => showStudy(i + 1), 1400);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function answer(choice) {
    const item = testWords[testIdx];
    const correct =
      (choice === "A" && item.source === "A") ||
      (choice === "B" && item.source === "B") ||
      (choice === "new" && !item.shown);
    const nr = [...rows, { word: item.word, correct, choice, actual: item.source || "new" }];
    setRows(nr);
    if (testIdx >= testWords.length - 1) setPhase("done");
    else setTestIdx(testIdx + 1);
  }

  const score = rows.filter(r => r.correct).length;
  const sourceErr = rows.filter(r => r.shown && r.choice !== "new" && !r.correct).length;

  return (
    <GameShell
      cite="Johnson et al., 1993"
      instructions={<ol>
        <li>Words will appear one at a time, each from either <strong>List A</strong> or <strong>List B</strong>.</li>
        <li>Study which list each word came from.</li>
        <li>Then you'll be tested — was each word in A, B, or completely new?</li>
        <li>Source monitoring is harder than simple recognition.</li>
      </ol>}
      phase={phase} headline="which list was it in?"
      explain="Remembering where you learned something is harder than remembering that you learned it."
      onBegin={begin} onReset={begin}
      footer={studyDone ? `test ${testIdx + 1}/${testWords.length}` : `study ${studyIdx + 1}/${items.length}`}
      results={[
        { label: "correct source", value: `${score}/${testWords.length}` },
        { label: "source errors",  value: sourceErr },
        { label: "context memory", value: score >= 6 ? "strong" : score >= 4 ? "typical" : "weak" }
      ]}
      doneText="Source monitoring errors — remembering a word but misattributing where you learned it — are a normal and fascinating memory failure."
    >
      <div className="center-stack">
        {!studyDone ? (
          <>
            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.14em", color: items[studyIdx]?.source === "A" ? "#2563EB" : "#DC2626" }}>
              List {items[studyIdx]?.source}
            </div>
            <div className="mono-big">{items[studyIdx]?.word}</div>
          </>
        ) : (
          <>
            <p className="task-explain">
              Where did you see <strong style={{ fontSize: "1.3em" }}>{testWords[testIdx]?.word}</strong>?
            </p>
            <div className="choice-row">
              <button className="choice-btn" onClick={() => answer("A")}>List A</button>
              <button className="choice-btn" onClick={() => answer("B")}>List B</button>
              <button className="choice-btn" onClick={() => answer("new")}>New word</button>
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}

Object.assign(window, { FalseMemory, SourceMonitoring });
}
