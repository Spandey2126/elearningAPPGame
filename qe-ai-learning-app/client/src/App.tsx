import { useEffect, useRef, useState } from 'react';
import { course, lessons, ORIENTATION_MINUTES, FINAL_EXAM_MINUTES, TOTAL_MINUTES, TRACKS, type Stage } from './content/course';
import { loadProgress, saveProgress, type Progress } from './services/progress';
import {
  allLessonsDone, bestPercent, CHECKPOINT_PASS_PERCENT, finalPassed, finalUnlocked, FINAL_PASS_PERCENT,
  isStageComplete, lessonsDone, stageStatus, type StageStatus,
  formatPercent, scoreMeetsThreshold,
} from './services/game';
import { Quiz } from './components/Quiz';
import { TutorPanel } from './components/TutorPanel';
import { AwsGame } from './components/AwsGame';
import { TechnicalExplainer } from './components/TechnicalExplainer';
import { explainers } from './content/explainers';
import './qe-game.css';

type View = { name: 'dashboard' } | { name: 'stage'; id: string } | { name: 'final' };

const BADGE: Record<StageStatus, string> = { locked: '🔒 Locked', available: '▶ Available', 'in-progress': '◐ In progress', completed: '✔ Completed' };
const CAPSTONE = '/QE_for_AI_Learning_Game_Capstone_Project_Submission_Brief.docx';

export default function App() {
  const [area, setArea] = useState<'aws' | 'qe'>(() => new URLSearchParams(window.location.search).get('area') === 'aws' ? 'aws' : 'qe');
  const changeArea = (next: 'aws' | 'qe') => {
    const url = new URL(window.location.href);
    url.searchParams.set('area', next);
    window.history.replaceState(null, '', url);
    setArea(next);
  };
  return <div className="learning-shell">
    <header className="global-header"><a className="cloud-brand" href="/" aria-label="Learning arcade home"><span aria-hidden="true">◈</span> {area === 'qe' ? 'QE Quest' : 'CloudQuest'}<span className="brand-period">.</span></a>
      <nav aria-label="Learning areas"><button aria-pressed={area === 'qe'} onClick={() => changeArea('qe')}>QE learning path</button><button aria-pressed={area === 'aws'} onClick={() => changeArea('aws')}>AWS fundamentals</button></nav>
      <span className="header-label">THE LEARNING ARCADE <span aria-hidden="true">✦</span></span>
    </header>
    {area === 'aws' ? <AwsGame /> : <QeApp />}
  </div>;
}

function QeApp() {
  const mainRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [view, setView] = useState<View>({ name: 'dashboard' });
  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.querySelector<HTMLElement>('[data-view-heading]')?.focus({ preventScroll: true });
  }, [view]);

  const toggleLesson = (id: string) =>
    setProgress((p) => ({ ...p, completedLessons: p.completedLessons.includes(id) ? p.completedLessons.filter((x) => x !== id) : [...p.completedLessons, id] }));
  const addAttempt = (testId: string, r: { score: number; total: number; percent: number }) =>
    setProgress((p) => ({ ...p, attempts: [...p.attempts, { testId, ...r, at: new Date().toISOString() }] }));
  const home = <button onClick={() => setView({ name: 'dashboard' })}>Back to stage map</button>;

  return (
    <main ref={mainRef} className={`qe-game ${view.name === 'dashboard' ? 'qe-map' : 'qe-lesson'}`}>
      <header className="qe-page-heading"><span className="qe-eyebrow">LOCAL LEARNING · PRACTICAL QUALITY ENGINEERING</span><h1 tabIndex={-1} data-view-heading={view.name === 'dashboard' ? '' : undefined}>{course.title}</h1></header>
      {view.name === 'dashboard' && <Dashboard progress={progress} open={setView} />}
      {view.name === 'stage' && (() => {
        const stage = course.stages.find((s) => s.id === view.id)!;
        return stageStatus(stage, progress) === 'locked' ? <>{home}<p>This stage is locked. Complete the earlier stages first.</p></> : <StageView key={stage.id} stage={stage} progress={progress} toggleLesson={toggleLesson} submit={(r) => addAttempt(stage.id, r)} home={home} />;
      })()}
      {view.name === 'final' && <FinalView progress={progress} submit={(r) => addAttempt('final', r)} home={home} />}
    </main>
  );
}

function Dashboard({ progress, open }: { progress: Progress; open: (v: View) => void }) {
  const next = course.stages.find((s) => stageStatus(s, progress) !== 'completed');
  const passed = finalPassed(progress);
  const completed = course.stages.filter(s => stageStatus(s, progress) === 'completed').length;
  return (
    <>
      <section className="qe-hero" aria-label="Your QE adventure">
        <div><span className="qe-eyebrow">LEARN IT. SEE IT. PUT IT TO THE TEST.</span><h2>Your next level<br />in <span>quality engineering.</span></h2><p>{course.description}</p><button onClick={() => open(next ? { name: 'stage', id: next.id } : { name: 'final' })}>{passed ? 'View your completion badge' : next ? `Continue: Stage ${next.order}` : 'Continue: Final exam'} <span aria-hidden="true">→</span></button><p className="qe-hero-meta">4 hours · 4 tracks · Your progress stays local</p></div>
        <div className="qe-hero-visual" aria-hidden="true"><div className="qe-orbit"><span>TypeScript</span><span>Playwright</span><span>POM + CI</span><span>Local AI</span><img src="/images/avatar-nova.svg" alt="" /></div><p>YOUR MISSION: BUILD CONFIDENCE</p></div>
      </section>
      <section className="qe-stats" aria-label="QE campaign progress"><div><span className="qe-eyebrow">STAGES COMPLETE</span><strong>{completed} <small>/ 8</small></strong></div><div><span className="qe-eyebrow">EXPERIENCE EARNED</span><strong>{completed * 100 + (passed ? 200 : 0)} <small>XP</small></strong></div><div><span className="qe-eyebrow">FINAL EXAM</span><strong>{passed ? 'Passed' : finalUnlocked(progress) ? 'Ready' : 'Locked'}</strong></div><div><label htmlFor="qe-progress">CAMPAIGN PROGRESS</label><progress id="qe-progress" aria-label="QE campaign completion" value={completed + Number(passed)} max={9} /><span>{completed + Number(passed)} of 9 stages</span></div></section>
      <section aria-label="Orientation" className="card">
        <h2>Orientation ({ORIENTATION_MINUTES} min)</h2>
        <p>Work through the stages in order. Finish a stage's lesson and submit its checkpoint test to unlock the next one. Then take the final exam (pass mark {FINAL_PASS_PERCENT}%).
          Required time: {TOTAL_MINUTES} minutes maximum. Tutor questions and retakes are optional and extra.</p>
        <p className="notice">Progress is saved in this browser on this device only (localStorage).</p>
      </section>
      <p className="qe-course-budget">5 min orientation + 8 × (20 min learning, practice and explainer + 5 min checkpoint) + 35 min final = 240 min.</p>
      <section aria-label="Stage map">
        <div className="qe-map-heading"><div><span className="qe-eyebrow">YOUR LEARNING CAMPAIGN</span><h2>Stage map</h2></div><p>100 XP per completed topic stage · 200 XP for the final</p></div>
        <ol className="stages">
          {course.stages.map((s) => {
            const st = stageStatus(s, progress);
            const cutoff = CHECKPOINT_PASS_PERCENT;
            const submitted = progress.attempts.some((a) => a.testId === s.id);
            const left = [!allLessonsDone(s, progress) && 'complete the lesson', !submitted ? 'submit the checkpoint test' : cutoff !== null && !progress.attempts.some(a => a.testId === s.id && scoreMeetsThreshold(a, cutoff)) && `retake the checkpoint and earn at least ${cutoff}%`].filter(Boolean).join(' and ');
            return (
              <li key={s.id} className={`card status-${st}`}>
                <span className={`qe-stage-icon qe-track-${s.trackId}`} aria-hidden="true">{['{ }', 'TS', '▷', '⇄', '▱', '⑂', '✦', '✓'][s.order - 1]}</span>
                <h3>Stage {s.order}: {s.title}</h3>
                <p className="badge">{BADGE[st]}</p>
                <p>{s.description} <em>({TRACKS[s.trackId]})</em></p>
                <p className="qe-stage-meta">{s.learningMinutes + s.testMinutes} min · Animated explainer included</p><p>Lessons {lessonsDone(s, progress)}/{s.lessonIds.length}. Checkpoint best: {bestPercent(s.id, progress) === null ? 'not taken' : `${formatPercent(bestPercent(s.id, progress)!)}%`}</p>
                {st !== 'completed' && st !== 'locked' && <p className="notice">To finish: {left}.</p>}
                {st === 'locked' && <p className="notice">Complete all earlier stages to unlock.</p>}
                <button disabled={st === 'locked'} onClick={() => open({ name: 'stage', id: s.id })}>{st === 'completed' ? 'Review' : 'Open'} Stage {s.order}</button>
              </li>
            );
          })}
          <li className={`card status-${passed ? 'completed' : finalUnlocked(progress) ? 'available' : 'locked'}`}>
            <span className="qe-stage-icon qe-final-icon" aria-hidden="true">♜</span>
            <h3>Stage 9: Final exam</h3>
            <p className="badge">{passed ? '✔ Passed' : finalUnlocked(progress) ? '▶ Available' : '🔒 Locked'}</p>
            <p>Cumulative MCQs from Stages 1-8. {FINAL_EXAM_MINUTES} min. Pass mark {FINAL_PASS_PERCENT}%. Best: {bestPercent('final', progress) === null ? 'not taken' : `${formatPercent(bestPercent('final', progress)!)}%`}</p>
            {!finalUnlocked(progress) && <p className="notice">Locked until Stages 1-8 are complete.</p>}
            <button disabled={!finalUnlocked(progress)} onClick={() => open({ name: 'final' })}>Open final exam</button>
          </li>
        </ol>
      </section>
    </>
  );
}

function StageView({ stage, progress, toggleLesson, submit, home }: {
  stage: Stage; progress: Progress; toggleLesson: (id: string) => void;
  submit: (r: { score: number; total: number; percent: number }) => void; home: JSX.Element;
}) {
  const ready = allLessonsDone(stage, progress);
  return (
    <>
      {home}
      <h2 tabIndex={-1} data-view-heading>Stage {stage.order}: {stage.title}</h2>
      <p className="qe-stage-meta">{TRACKS[stage.trackId]} · {stage.learningMinutes} min learning and practice + {stage.testMinutes} min checkpoint</p>
      <p className="badge">{BADGE[stageStatus(stage, progress)]}{isStageComplete(stage, progress) && ' - lesson done and checkpoint submitted'}</p>
      {stage.lessonIds.map((id) => {
        const l = lessons.find((x) => x.id === id)!;
        const done = progress.completedLessons.includes(id);
        return (
          <article key={id} className="card" aria-label={`Lesson: ${l.title}`}>
            <h3>{l.title} ({l.minutes} min)</h3>
            <p><strong>Prerequisites:</strong> {l.prerequisites}</p>
            <ul>{l.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
            <p>{l.explanation}</p>
            {l.codeExample && <pre><code>{l.codeExample}</code></pre>}
            <TechnicalExplainer key={stage.id} explainer={explainers[stage.id]} />
            <h4>Guided lab</h4>
            <ol>{l.labSteps.map((s) => <li key={s}>{s}</li>)}</ol>
            {l.labExtension && <p><em>Optional extension:</em> {l.labExtension}</p>}
            <h4>Common mistakes</h4>
            <ul>{l.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
            <section aria-label="Knowledge check">
              <h4>Knowledge check</h4>
              <Quiz submitLabel="Check answers" questions={l.quiz.map((k, i) => ({ id: `${l.id}-k${i}`, marks: 1, ...k }))} />
            </section>
            <button aria-pressed={done} onClick={() => toggleLesson(id)}>{done ? '✔ Lesson complete (undo)' : 'Mark lesson complete'}</button>
            <TutorPanel lessonTitle={l.title} lessonText={l.explanation} />
          </article>
        );
      })}
      <section aria-label="Checkpoint test" className="card">
        <h3>Checkpoint test ({stage.testMinutes} min)</h3>
        {CHECKPOINT_PASS_PERCENT === null && <p className="notice">Submitting this test completes the stage once the lesson is done. Retakes are allowed.</p>}
        <Quiz questions={stage.checkpointQuestions} submitLabel="Submit test" passPercent={CHECKPOINT_PASS_PERCENT} onSubmit={submit}
          disabledReason={ready ? undefined : 'Mark the lesson complete to unlock this test.'} />
        <AttemptHistory progress={progress} testId={stage.id} />
      </section>
    </>
  );
}

function FinalView({ progress, submit, home }: { progress: Progress; submit: (r: { score: number; total: number; percent: number }) => void; home: JSX.Element }) {
  const passed = finalPassed(progress);
  return (
    <>
      {home}
      <h2 tabIndex={-1} data-view-heading>Stage 9: Final exam</h2>
      {passed && (
        <section aria-label="Course complete" className="card status-completed">
          <h3>🏅 Course complete</h3>
          <p>You passed the final exam with at least {FINAL_PASS_PERCENT}%. This is a course-completion badge, not an externally accredited credential.</p>
          <p><a href={CAPSTONE} download>Open the capstone project submission brief</a> (separate from the {TOTAL_MINUTES}-minute course).</p>
        </section>
      )}
      <section aria-label="Final exam" className="card">
        <p>{FINAL_EXAM_MINUTES} min. Pass mark {FINAL_PASS_PERCENT}% of available marks. Retakes keep your completed lessons.</p>
        <Quiz questions={course.finalExamQuestions} submitLabel="Submit final exam" passPercent={FINAL_PASS_PERCENT} onSubmit={submit}
          disabledReason={finalUnlocked(progress) ? undefined : 'Complete Stages 1-8 to unlock the final exam.'} />
        <AttemptHistory progress={progress} testId="final" />
      </section>
    </>
  );
}

function AttemptHistory({ progress, testId }: { progress: Progress; testId: string }) {
  const attempts = progress.attempts.filter(a => a.testId === testId);
  if (!attempts.length) return null;
  return <details className="qe-attempt-history"><summary>Saved attempts ({attempts.length})</summary><ol>{attempts.map((a, i) => <li key={`${a.at}-${i}`}><strong>{formatPercent(a.percent)}%</strong> ({a.score} / {a.total} marks) · <time dateTime={a.at}>{new Date(a.at).toLocaleString()}</time>{testId === 'final' ? scoreMeetsThreshold(a, FINAL_PASS_PERCENT) ? ' · Passed' : ' · Not passed' : ' · Submitted'}</li>)}</ol></details>;
}
