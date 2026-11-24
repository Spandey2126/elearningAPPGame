import { useEffect, useState } from 'react';
import { missions, type Mission } from '../content/awsMissions';
import { TutorPanel } from './TutorPanel';
import '../cloud-game.css';

function ArrowIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>; }
function LockIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>; }

const STORAGE = 'cloudquest.aws.v1';
const guides = [
  { id: 'nova', name: 'Nova', role: 'Your cloud navigator' },
  { id: 'byte', name: 'Byte', role: 'Your curious co-pilot' },
  { id: 'orbit', name: 'Orbit', role: 'Your systems explorer' },
];
type Saved = { completed: string[]; guide: string };
function load(): Saved {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    return { completed: Array.isArray(value?.completed) ? [...new Set<string>(value.completed.filter((id: unknown) => missions.some(m => m.id === id)))] : [], guide: guides.some(g => g.id === value?.guide) ? value.guide : 'nova' };
  } catch { return { completed: [], guide: 'nova' }; }
}

export function AwsGame() {
  const [saved, setSaved] = useState<Saved>(load);
  const [active, setActive] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(saved)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [saved]);
  useEffect(() => { window.scrollTo(0, 0); }, [active]);
  const guide = guides.find(g => g.id === saved.guide)!;
  const next = missions.find(m => !saved.completed.includes(m.id));
  const completed = saved.completed.length;
  const current = missions.find(m => m.id === active);
  const unlocked = (index: number) => index === 0 || missions.slice(0, index).every(m => saved.completed.includes(m.id));
  const openMission = (m: Mission) => { if (unlocked(missions.indexOf(m))) setActive(m.id); };

  return <main className="cloud-game">
    <div className="quest-topline"><span><i className="live-dot" /> YOUR LEARNING WORKSPACE</span><span className="simulation-pill">◈ &nbsp; Simulation mode</span></div>
    {storageError && <p role="alert" className="error">Browser storage is unavailable. You can still play, but progress will be lost when you leave.</p>}
    {current ? <MissionConsole key={current.id} mission={current} guide={guide} completed={saved.completed.includes(current.id)}
      back={() => setActive(null)} finish={() => setSaved(p => ({ ...p, completed: [...new Set([...p.completed, current.id])] }))} /> : <>
      <section className="quest-hero" aria-labelledby="quest-title">
        <div className="hero-copy"><div className="eyebrow">BUILD SKILLS. UNLOCK POSSIBILITIES.</div><h1 id="quest-title">Your cloud adventure<br />starts <span>here.</span></h1>
          <p>Learn AWS fundamentals one mission at a time. Explore services, solve challenges, and build your cloud confidence.</p>
          <button className="quest-primary" onClick={() => openMission(next || missions[0])}>{completed === missions.length ? 'Revisit your missions' : completed ? 'Continue your adventure' : 'Start your first mission'} <ArrowIcon /></button>
          <div className="hero-meta"><span>◷ &nbsp; 45 min learning path</span><span>◇ &nbsp; Beginner friendly</span></div>
        </div>
        <img className="hero-art" src="/images/cloud-islands.png" alt="Floating cloud islands connected by glowing bridges, with servers, storage, databases and a friendly robot guide" />
        <span className="art-caption">A little curiosity. A whole new world.</span>
      </section>

      <section className="quest-stats" aria-label="Your adventure progress">
        <div className="stat-level"><span className="level-mark">{Math.floor(completed / 2) + 1}</span><div><small>YOUR RANK</small><strong>{completed === 7 ? 'Cloud explorer' : completed > 2 ? 'Cloud adventurer' : 'Cloud rookie'}</strong></div></div>
        <div><small>TOTAL EXPERIENCE</small><strong><span className="xp-star">✦</span> {completed * 100} <em>XP</em></strong></div>
        <div><small>MISSIONS COMPLETED</small><strong>{completed} <em>/ {missions.length}</em></strong></div>
        <div className="progress-stat"><div><small>LEARNING PATH</small><b>{Math.round(completed / missions.length * 100)}%</b></div><progress aria-label="AWS learning path completion" value={completed} max={missions.length} /></div>
      </section>

      <div className="quest-content">
        <section className="missions-section" aria-labelledby="mission-heading">
          <div className="section-heading"><div><div className="eyebrow">YOUR NEXT BIG THING</div><h2 id="mission-heading">The fundamentals quest</h2><p>Small missions. Real understanding.</p></div><span className="path-count">01 — 07</span></div>
          <ol className="mission-grid">{missions.map((m, i) => {
            const done = saved.completed.includes(m.id), locked = !unlocked(i);
            return <li key={m.id} className={`mission-card ${locked ? 'is-locked' : ''} ${done ? 'is-done' : ''}`}>
              <div className="mission-card-top"><span className={`service-icon ${m.color}`} aria-hidden="true">{m.icon}</span><span className={`mission-state ${done ? 'done' : ''}`}>{done ? '✓ Completed' : locked ? 'Locked' : '● Ready to play'}</span></div>
              <div className="mission-number">MISSION {String(i + 1).padStart(2, '0')} <span>· {m.service}</span></div>
              <h3>{m.title}</h3><p>{m.description}</p>
              <div className="mission-card-bottom"><span>◷ {m.minutes} min <b>✦ 100 XP</b></span><button aria-label={`${done ? 'Replay' : 'Start'} ${m.service} mission`} disabled={locked} onClick={() => openMission(m)}>{locked ? <LockIcon /> : <ArrowIcon />}</button></div>
              {locked && <span className="unlock-hint">Complete mission {i} to unlock</span>}
            </li>;
          })}</ol>
        </section>
        <aside className="quest-sidebar">
          <section className="guide-card"><div className="eyebrow">BETTER TOGETHER</div><h2>Meet your co-pilot</h2><div className="guide-portrait"><img src={`/images/avatar-${guide.id}.svg`} alt={`${guide.name}, your robot learning guide`} /></div><h3>{guide.name}</h3><p>{guide.role}. Here to help turn<br />“what if?” into “I get it.”</p><div className="guide-options" aria-label="Choose your guide">{guides.map(g => <button key={g.id} aria-label={`Choose ${g.name}`} aria-pressed={saved.guide === g.id} onClick={() => setSaved(p => ({ ...p, guide: g.id }))}><img src={`/images/avatar-${g.id}.svg`} alt="" /></button>)}</div><span className="tiny-label">CHOOSE YOUR ADVENTURE BUDDY</span></section>
          <section className={`badge-card ${completed === 7 ? 'badge-earned' : ''}`}><div className="eyebrow">{completed === 7 ? 'BADGE UNLOCKED' : 'YOUR NEXT MILESTONE'}</div><div className="achievement" aria-hidden="true">✧</div><h3>Cloud foundations</h3><p>{completed === 7 ? 'All seven missions complete. You earned this!' : 'Complete all 7 missions to earn your first explorer badge.'}</p><span>{completed} / 7 missions completed</span></section>
          <div className="safe-note"><span aria-hidden="true">◇</span><p>A safe place to experiment.<br /><strong>No AWS account. No real charges.</strong></p></div>
        </aside>
      </div>
    </>}
    <footer className="quest-footer"><span>CloudQuest <span aria-hidden="true">✦</span> Learn by exploring.</span><span>Independent learning simulation · Not affiliated with AWS</span><span>Progress stays in this browser.</span></footer>
  </main>;
}

function MissionConsole({ mission: m, guide, completed, back, finish }: {
  mission: Mission; guide: typeof guides[number]; completed: boolean; back: () => void; finish: () => void;
}) {
  const [wasCompleted] = useState(completed);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const errors = m.fields.filter(f => values[f.id] !== f.correct);
  const number = missions.indexOf(m) + 1;
  function deploy(e: React.FormEvent) {
    e.preventDefault(); setSubmitted(true);
    if (errors.length === 0) { setSuccess(true); finish(); }
  }
  return <>
    <button className="quest-back" onClick={back}>← Back to mission map</button>
    <div className="mission-page-heading"><span className={`service-icon ${m.color}`}>{m.icon}</span><div><div className="eyebrow">MISSION {String(number).padStart(2, '0')} / 07 · {m.category}</div><h1>{m.title}</h1></div><span className="console-reward">✦ 100 XP</span></div>
    <div className="console-layout">
      <div><section className="briefing-panel"><div className="eyebrow">YOUR MISSION</div><h2>The challenge</h2><p>{m.goal}</p><details open><summary>What you need to know</summary><p>{m.lesson}</p></details></section>
        <section className="sim-console" aria-label={`${m.service} simulated console`}><div className="console-bar"><span>▦ &nbsp; Learning console</span><span>US East (N. Virginia) <b>SIMULATED</b></span></div><div className="console-breadcrumb">Services <span>›</span> {m.service} <span>›</span> Configure</div>
          <form onSubmit={deploy} noValidate><h2>Configure {m.service}</h2><p className="console-intro">Choose settings that meet the mission requirements.</p>{m.fields.map(f => {
            const invalid = submitted && values[f.id] !== f.correct;
            return <div className="console-field" key={f.id}><label htmlFor={f.id}>{f.label}</label><select id={f.id} value={values[f.id] || f.options[0]} aria-invalid={invalid} aria-describedby={invalid ? `${f.id}-hint` : undefined} disabled={success} onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}>{f.options.map((o, i) => <option key={o} disabled={i === 0} value={o}>{o}</option>)}</select>{invalid && <p id={`${f.id}-hint`} className="field-hint">{f.hint}</p>}</div>;
          })}
          {submitted && errors.length > 0 && <div className="console-error" role="alert">Almost there. Review the {errors.length} highlighted {errors.length === 1 ? 'setting' : 'settings'} and try again. No XP lost.</div>}
          {!success && <button className="quest-primary" type="submit">Validate configuration <ArrowIcon /></button>}
          {success && <div className="mission-success" role="status"><span>✦</span><h3>Mission accomplished!</h3><p>{wasCompleted ? 'Configuration verified. Your 100 XP for this mission is already recorded.' : 'Configuration verified. +100 XP earned.'} {number < 7 ? 'Your next mission is ready on the map.' : 'Your learning path is complete.'}</p>{number === 7 && <p>You’ve completed the path and earned the Cloud foundations badge.</p>}<button type="button" className="quest-primary" onClick={back}>Return to mission map →</button></div>}
          <p className="console-disclaimer">Practice configuration only. No AWS API calls or resources are created.</p></form>
        </section>
      </div>
      <aside><section className="mission-guide"><img src={`/images/avatar-${guide.id}.svg`} alt="" /><div><strong>{guide.name}’s field notes</strong><p>Read the challenge first. Every setting has a purpose. It’s okay to try again!</p></div></section><section className="tutor-card"><TutorPanel guide={guide.id} lessonTitle={`AWS ${m.service}: ${m.title}`} lessonText={`${m.lesson}\nMission: ${m.goal}`} /></section></aside>
    </div>
  </>;
}
