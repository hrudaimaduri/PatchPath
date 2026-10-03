import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3001";

const EXAMPLE_ISSUES = [
  "Improve the command line interface and make repository input easier for users",
  "Add better validation for repository URLs",
  "Improve error handling when a repository cannot be accessed",
];

function App() {
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/coderamp-labs/gitingest"
  );

  const [issue, setIssue] = useState(
    "Improve the command line interface and make repository input easier for users"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);

  const loadingStages = [
    {
      number: "01",
      title: "Cloning repository",
      description: "Pulling the codebase into the investigation engine",
    },
    {
      number: "02",
      title: "Mapping the codebase",
      description: "Finding files connected to the issue",
    },
    {
      number: "03",
      title: "Collecting evidence",
      description: "Reading relevant source files and existing patterns",
    },
    {
      number: "04",
      title: "Qwen reasoning",
      description: "Turning repository evidence into a change map",
    },
  ];

  useEffect(() => {
    if (!loading) return;

    setStage(0);

    const interval = setInterval(() => {
      setStage((current) =>
        current < loadingStages.length - 1 ? current + 1 : current
      );
    }, 2600);

    return () => clearInterval(interval);
  }, [loading]);

  async function analyzeIssue() {
    if (!repoUrl.trim() || !issue.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setStage(0);

    try {
      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          issue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function startNewAnalysis() {
    setResult(null);
    setError("");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  function selectExample(example) {
    setIssue(example);
  }

  const blueprint = result?.blueprint;
  const changeSurface = blueprint?.change_surface || [];
  const implementationSteps = blueprint?.implementation_steps || [];
  const patterns = blueprint?.existing_patterns || [];
  const tests = blueprint?.test_plan || [];
  const risks = blueprint?.risks || [];
  const files = result?.filesAnalyzed || [];

  return (
    <div className="app">
      <div className="noise" />

      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <div className="glow glow-three" />

      {/* ───────────────── TOP BAR ───────────────── */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P</div>

          <div>
            <div className="brand-name">PatchPath</div>

            <div className="brand-subtitle">
              Open-source contribution intelligence
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="powered">
            <span className="status-dot" />
            Qwen powered
          </div>

          <div className="open-source-badge">
            OPEN SOURCE AI
          </div>
        </div>
      </header>

      <main>
        {/* ───────────────── HERO ───────────────── */}

        {!result && (
          <section className="hero">
            <div className="eyebrow hero-eyebrow">
              <span>GITHUB ISSUE</span>
              <span className="eyebrow-arrow">→</span>
              <span>CODEBASE EVIDENCE</span>
              <span className="eyebrow-arrow">→</span>
              <span>CHANGE MAP</span>
            </div>

            <div className="hero-title-wrap">
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />

              <h1>
                Know{" "}
                <span className="gradient-text">
                  where to change
                </span>
                <br />
                before you change it.
              </h1>
            </div>

            <p className="hero-text">
              PatchPath investigates an open-source repository and turns
              a GitHub issue into an evidence-backed implementation
              blueprint.
            </p>

            {/* Product pipeline */}

            <div className="pipeline">
              <div className="pipeline-node active">
                <div className="pipeline-icon">01</div>
                <span>ISSUE</span>
              </div>

              <div className="pipeline-connector">
                <span />
              </div>

              <div className="pipeline-node">
                <div className="pipeline-icon">02</div>
                <span>CODEBASE</span>
              </div>

              <div className="pipeline-connector">
                <span />
              </div>

              <div className="pipeline-node">
                <div className="pipeline-icon">03</div>
                <span>EVIDENCE</span>
              </div>

              <div className="pipeline-connector">
                <span />
              </div>

              <div className="pipeline-node">
                <div className="pipeline-icon">04</div>
                <span>BLUEPRINT</span>
              </div>
            </div>

            {/* Input */}

            <div className={`input-card ${loading ? "is-loading" : ""}`}>
              <div className="card-topline">
                <div>
                  <span className="mini-label">INVESTIGATION INPUT</span>
                  <span className="mini-status">
                    {loading ? "RUNNING" : "READY"}
                  </span>
                </div>

                <div className="engine-indicator">
                  <span />
                  PATCHPATH ENGINE
                </div>
              </div>

              <div className="field">
                <label>REPOSITORY</label>

                <div className="input-wrap">
                  <span className="input-icon">⌘</span>

                  <input
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    disabled={loading}
                  />

                  <span className="input-valid">GITHUB</span>
                </div>
              </div>

              <div className="field">
                <div className="label-row">
                  <label>ISSUE</label>
                  <span className="character-count">
                    {issue.length} chars
                  </span>
                </div>

                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe the GitHub issue..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Example issues */}

              {!loading && (
                <div className="examples">
                  <span>TRY AN EXAMPLE</span>

                  <div className="example-list">
                    {EXAMPLE_ISSUES.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => selectExample(example)}
                        className="example-chip"
                      >
                        {example.length > 48
                          ? `${example.slice(0, 48)}...`
                          : example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyze button */}

              <button
                className={`analyze-button ${loading ? "loading-button" : ""}`}
                onClick={analyzeIssue}
                disabled={loading || !repoUrl.trim() || !issue.trim()}
              >
                {loading ? (
                  <>
                    <span className="button-loader" />
                    Investigating codebase
                    <span className="button-dots">...</span>
                  </>
                ) : (
                  <>
                    Analyze Issue
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>

              {/* Loading investigation UI */}

              {loading && (
                <div className="investigation-panel">
                  <div className="investigation-header">
                    <div>
                      <span className="mini-label">
                        LIVE INVESTIGATION
                      </span>

                      <strong>
                        {loadingStages[stage].title}
                      </strong>
                    </div>

                    <div className="stage-counter">
                      {loadingStages[stage].number}/04
                    </div>
                  </div>

                  <p className="investigation-description">
                    {loadingStages[stage].description}
                  </p>

                  <div className="stage-list">
                    {loadingStages.map((item, index) => {
                      const completed = index < stage;
                      const current = index === stage;

                      return (
                        <div
                          className={`stage-item ${
                            completed
                              ? "completed"
                              : current
                              ? "current"
                              : ""
                          }`}
                          key={item.number}
                        >
                          <div className="stage-icon">
                            {completed ? "✓" : item.number}
                          </div>

                          <div className="stage-content">
                            <strong>{item.title}</strong>

                            {current && (
                              <span>processing...</span>
                            )}
                          </div>

                          {current && (
                            <div className="stage-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="analysis-line">
                    <span />
                  </div>

                  <div className="reasoning-note">
                    <span className="reasoning-symbol">✦</span>

                    <div>
                      <strong>Qwen is reasoning over repository evidence</strong>
                      <p>
                        PatchPath does not generate a generic answer.
                        It grounds the blueprint in files discovered inside
                        the actual repository.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="error-box">
                <div className="error-icon">!</div>

                <div>
                  <strong>Analysis failed</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Feature row */}

            <div className="feature-row">
              <div className="feature">
                <strong>01</strong>
                <span>Repository-aware</span>
              </div>

              <div className="feature-divider" />

              <div className="feature">
                <strong>02</strong>
                <span>Evidence-backed</span>
              </div>

              <div className="feature-divider" />

              <div className="feature">
                <strong>03</strong>
                <span>Contributor-focused</span>
              </div>
            </div>
          </section>
        )}

        {/* ───────────────── RESULTS ───────────────── */}

        {result && (
          <section className="results" id="results">
            <div className="results-header">
              <div>
                <div className="eyebrow results-eyebrow">
                  <span>PATCHPATH ANALYSIS</span>

                  <span className="complete-pill">
                    <span />
                    COMPLETE
                  </span>
                </div>

                <h2>Implementation Blueprint</h2>

                <p className="result-meta">
                  {result.repository}{" "}
                  <span>·</span>{" "}
                  {files.length} files investigated
                </p>
              </div>

              <button
                className="new-analysis"
                onClick={startNewAnalysis}
              >
                ← New analysis
              </button>
            </div>

            {/* Stats */}

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">⌁</span>
                <div>
                  <strong>{files.length}</strong>
                  <span>Files analyzed</span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon purple">◈</span>
                <div>
                  <strong>{changeSurface.length}</strong>
                  <span>Change points</span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon green">✓</span>
                <div>
                  <strong>{tests.length}</strong>
                  <span>Test signals</span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon orange">!</span>
                <div>
                  <strong>{risks.length}</strong>
                  <span>Risk signals</span>
                </div>
              </div>
            </div>

            {/* Investigation chain */}

            <div className="result-chain">
              <div className="chain-item">
                <span className="chain-number">01</span>
                <span>ISSUE</span>
              </div>

              <span className="chain-arrow">→</span>

              <div className="chain-item">
                <span className="chain-number">02</span>
                <span>EVIDENCE</span>
              </div>

              <span className="chain-arrow">→</span>

              <div className="chain-item active">
                <span className="chain-number">03</span>
                <span>CHANGE SURFACE</span>
              </div>

              <span className="chain-arrow">→</span>

              <div className="chain-item">
                <span className="chain-number">04</span>
                <span>TEST PLAN</span>
              </div>
            </div>

            {/* Summary */}

            <div className="summary-card featured-panel">
              <div className="summary-header">
                <div className="section-label">INVESTIGATION SUMMARY</div>

                <span className="summary-badge">
                  QWEN × REPOSITORY EVIDENCE
                </span>
              </div>

              <p>{blueprint?.summary}</p>
            </div>

            {/* Change surface */}

            <div className="section-heading">
              <div>
                <div className="section-label">CHANGE SURFACE</div>
                <h3>Where should the contributor work?</h3>

                <p className="section-description">
                  Files PatchPath identified as relevant to implementing
                  this issue.
                </p>
              </div>

              <span className="evidence-badge">
                Evidence-backed
              </span>
            </div>

            <div className="change-grid">
              {changeSurface.map((item, index) => (
                <div
                  className="change-card"
                  key={`${item.file}-${index}`}
                >
                  <div className="change-card-glow" />

                  <div className="change-top">
                    <span
                      className={`action action-${item.action
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.action}
                    </span>

                    <span
                      className={`confidence confidence-${item.confidence?.toLowerCase()}`}
                    >
                      {item.confidence}
                    </span>
                  </div>

                  <div className="file-path">
                    <span className="file-symbol">›</span>
                    {item.file}
                  </div>

                  <div className="card-section">
                    <span>WHY THIS FILE?</span>
                    <p>{item.why}</p>
                  </div>

                  <div className="card-section evidence">
                    <span>EVIDENCE</span>
                    <p>{item.evidence}</p>
                  </div>

                  <div className="card-footer">
                    <span>CHANGE POINT {String(index + 1).padStart(2, "0")}</span>

                    <span className="card-arrow">↗</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Implementation + Patterns */}

            <div className="two-column">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="section-label">
                      IMPLEMENTATION SEQUENCE
                    </div>

                    <h3>How to approach it</h3>
                  </div>

                  <span className="panel-count">
                    {implementationSteps.length} STEPS
                  </span>
                </div>

                <div className="steps">
                  {implementationSteps.map((step, index) => (
                    <div className="step" key={index}>
                      <div className="step-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="section-label">
                      EXISTING PATTERNS
                    </div>

                    <h3>What the repo already does</h3>
                  </div>

                  <span className="pattern-live">
                    ● DETECTED
                  </span>
                </div>

                <div className="pattern-list">
                  {patterns.map((pattern, index) => (
                    <div className="pattern" key={index}>
                      <span>✓</span>
                      <p>{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test + Risks */}

            <div className="two-column">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="section-label">TEST PLAN</div>
                    <h3>How to validate the change</h3>
                  </div>

                  <span className="panel-count green-count">
                    {tests.length} CHECKS
                  </span>
                </div>

                <div className="pattern-list">
                  {tests.map((test, index) => (
                    <div className="pattern" key={index}>
                      <span className="check-icon">✓</span>
                      <p>{test}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="section-label">RISKS</div>
                    <h3>What could go wrong</h3>
                  </div>

                  <span className="panel-count risk-count">
                    {risks.length} SIGNALS
                  </span>
                </div>

                <div className="pattern-list">
                  {risks.map((risk, index) => (
                    <div className="pattern risk" key={index}>
                      <span>!</span>
                      <p>{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Repository evidence */}

            <div className="files-panel featured-panel">
              <div className="files-header">
                <div>
                  <div className="section-label">
                    REPOSITORY EVIDENCE
                  </div>

                  <h3>Files investigated by PatchPath</h3>
                </div>

                <span className="evidence-count">
                  {files.length} FILES
                </span>
              </div>

              <div className="files">
                {files.map((file, index) => (
                  <div className="file-chip" key={index}>
                    <span>⌁</span>
                    {file}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}

            <div className="bottom-cta">
              <div>
                <span className="mini-label">READY FOR THE CONTRIBUTOR?</span>

                <h3>
                  From issue to implementation surface.
                </h3>

                <p>
                  PatchPath gives contributors the evidence they need
                  before they touch the code.
                </p>
              </div>

              <button
                className="new-analysis primary-small"
                onClick={startNewAnalysis}
              >
                Analyze another issue →
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>PATCHPATH</span>

        <span>
          Built for React Hyderabad × MLH Hack Day 2026
        </span>

        <span>OPEN-SOURCE AI</span>
      </footer>
    </div>
  );
}

export default App;