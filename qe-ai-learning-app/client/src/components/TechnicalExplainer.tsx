import { useEffect, useId, useState } from 'react';
import type { TechnicalExplainer as Explainer } from '../content/explainers';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** A schematic of reviewed lesson content; no learner code or model is executed. */
export function TechnicalExplainer({ explainer }: { explainer: Explainer }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const titleId = useId();
  const frame = explainer.frames[index];
  const last = index === explainer.frames.length - 1;

  useEffect(() => {
    if (!playing || reduced || last) return;
    const timer = window.setTimeout(() => setIndex(i => i + 1), 5000);
    return () => window.clearTimeout(timer);
  }, [index, playing, reduced, last]);
  useEffect(() => { if (reduced || last) setPlaying(false); }, [reduced, last]);
  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);

  const stepTo = (next: number) => { setPlaying(false); setIndex(next); };
  return <section className={`technical-explainer ${playing ? 'is-playing' : ''}`} aria-labelledby={titleId}>
    <div className="explainer-heading"><div><span className="qe-eyebrow">CONCEPT IN MOTION</span><h4 id={titleId}>{explainer.title}</h4></div><span className="explainer-tag">Interactive explainer</span></div>
    <p>{explainer.summary}</p>
    <p className="explainer-note">Included in this stage’s 20-minute learning and practice block. This diagram illustrates the lesson; it does not run code.</p>
    <ol className="explainer-flow" aria-label="Concept flow">
      {explainer.nodes.map((node, i) => <li key={node} className={i === frame.activeNode ? 'active' : ''} aria-current={i === frame.activeNode ? 'step' : undefined}>
        <span className="flow-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{node}</span>
        {i === frame.activeNode && <span className="flow-signal" aria-hidden="true" />}
      </li>)}
    </ol>
    <div className="explainer-frame" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
      <div className="frame-narration"><span className="qe-eyebrow">STEP {index + 1} OF {explainer.frames.length}</span><h5>{frame.title}</h5><p>{frame.narration}</p></div>
      <pre aria-label={`Code snapshot: ${frame.title}`}><code>{frame.code}</code></pre>
    </div>
    <div className="explainer-controls" role="group" aria-label="Explainer playback controls">
      <button type="button" disabled={reduced} onClick={() => { if (last) setIndex(0); setPlaying(p => !p); }} aria-label={playing ? 'Pause explainer' : 'Play explainer'}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button>
      <button type="button" className="qe-secondary" onClick={() => stepTo(0)}>Replay from start</button>
      <div className="explainer-step-controls"><button type="button" className="qe-secondary" disabled={index === 0} onClick={() => stepTo(index - 1)}>Previous step</button><span>{index + 1} / {explainer.frames.length}</span><button type="button" className="qe-secondary" disabled={last} onClick={() => stepTo(index + 1)}>Next step</button></div>
    </div>
    {reduced && <p className="explainer-note">Reduced motion is on. Use Previous step and Next step, or read the full transcript below.</p>}
    <details className="explainer-transcript"><summary>Read the full explainer transcript</summary><ol>{explainer.frames.map((f, i) => <li key={f.id}><strong>{i + 1}. {f.title}</strong><p>{f.narration}</p><pre><code>{f.code}</code></pre></li>)}</ol></details>
  </section>;
}
