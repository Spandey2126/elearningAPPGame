import { useEffect, useState } from 'react';
import { course, lessons, ORIENTATION_MINUTES, FINAL_EXAM_MINUTES, TOTAL_MINUTES, TRACKS, type Stage } from './content/course';
import { loadProgress, saveProgress, type Progress } from './services/progress';
import {
  allLessonsDone, bestPercent, CHECKPOINT_PASS_PERCENT, finalPassed, finalUnlocked, FINAL_PASS_PERCENT,
  isStageComplete, lessonsDone, stageStatus, type StageStatus,
} from './services/game';
import { Quiz } from './components/Quiz';
import { TutorPanel } from './components/TutorPanel';

type View = { name: 'dashboard' } | { name: 'stage'; id: string } | { name: 'final' };

const BADGE: Record<StageStatus, string> = { locked: '🔒 Locked', available: '▶ Available', 'in-progress': '◐ In progress', completed: '✔ Completed' };
const CAPSTONE = '/QE_for_AI_Learning_Game_Capstone_Project_Submission_Brief.docx';

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [view, setView] = useState<View>({ name: 'dashboard' });
  useEffect(() => saveProgress(progress), [progress]);

  const toggleLesson = (id: string) =>
    setProgress((p) => ({ ...p, completedLessons: p.completedLessons.includes(id) ? p.completedLessons.filter((x) => x !== id) : [...p.completedLessons, id] }));
  const addAttempt = (testId: string, r: { score: number; total: number; percent: number }) =>
    setProgress((p) => ({ ...p, attempts: [...p.attempts, { testId, ...r, at: new Date().toISOString() }] }));
  const home = <button onClick={() => setView({ name: 'dashboard' })}>Back to stage map</button>;

  return (
    <main>
      <header><h1>{course.title}</h1></header>
      {view.name === 'dashboard' && <Dashboard progress={progress} open={setView} />}
      {view.name === 'stage' && (() => {
        const stage = course.stages.find((s) => s.id === view.id)!;
        return <StageView stage={stage} progress={progress} toggleLesson={toggleLesson} submit={(r) => addAttempt(stage.id, r)} home={home} />;
      })()}
      {view.name === 'final' && <FinalView progress={progress} submit={(r) => addAttempt('final', r)} home={home} />}
    </main>
  );
}

function Dashboard({ progress, open }: { progress: Progress; open: (v: View) => void }) {
  const next = course.stages.find((s) => stageStatus(s, progress) !== 'completed');
  const passed = finalPassed(progress);
  return (
    <>
      <p>{course.description}</p>
      <section aria-label="Orientation" className="card">
        <h2>Orientation ({ORIENTATION_MINUTES} min)</h2>
        <p>Work through the stages in order. Finish a stage's lesson and submit its checkpoint test to unlock the next one. Then take the final exam (pass mark {FINAL_PASS_PERCENT}%).
          Required time: {TOTAL_MINUTES} minutes maximum. Tutor questions and retakes are optional and extra.</p>
        <p className="notice">Progress is saved in this browser on this device only (localStorage).</p>
      </section>
      {next ? (
        <p><button onClick={() => open({ name: 'stage', id: next.id })}>Continue: Stage {next.order}</button></p>
      ) : !passed && <p><button onClick={() => open({ name: 'final' })}>Continue: Final exam</button></p>}
      <section aria-label="Stage map">
        <h2>Stage map</h2>
        <ol className="stages">
          {course.stages.map((s) => {
            const st = stageStatus(s, progress);
            const left = [!allLessonsDone(s, progress) && 'complete the lesson', !progress.attempts.some((a) => a.testId === s.id) && 'submit the checkpoint test'].filter(Boolean).join(' and ');
            return (
              <li key={s.id} className={`card status-${st}`}>
                <h3>Stage {s.order}: {s.title}</h3>
                <p className="badge">{BADGE[st]}</p>
                <p>{s.description} <em>({TRACKS[s.trackId]})</em></p>
                <p>{s.learningMinutes + s.testMinutes} min. Lessons {lessonsDone(s, progress)}/{s.lessonIds.length}. Checkpoint best: {bestPercent(s.id, progress) ?? 'not taken'}{bestPercent(s.id, progress) !== null && '%'}</p>
                {st !== 'completed' && st !== 'locked' && <p className="notice">To finish: {left}.</p>}
                {st === 'locked' && <p className="notice">Locked until Stage {s.order - 1} is complete.</p>}
                <button disabled={st === 'locked'} onClick={() => open({ name: 'stage', id: s.id })}>{st === 'completed' ? 'Review' : 'Open'} Stage {s.order}</button>
              </li>
            );
          })}
          <li className={`card status-${passed ? 'completed' : finalUnlocked(progress) ? 'available' : 'locked'}`}>
            <h3>Stage 9: Final exam</h3>
            <p className="badge">{passed ? '✔ Passed' : finalUnlocked(progress) ? '▶ Available' : '🔒 Locked'}</p>
            <p>Cumulative MCQs from Stages 1-8. {FINAL_EXAM_MINUTES} min. Pass mark {FINAL_PASS_PERCENT}%. Best: {bestPercent('final', progress) ?? 'not taken'}{bestPercent('final', progress) !== null && '%'}</p>
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
      <h2>Stage {stage.order}: {stage.title}</h2>
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
      </section>
    </>
  );
}

function FinalView({ progress, submit, home }: { progress: Progress; submit: (r: { score: number; total: number; percent: number }) => void; home: JSX.Element }) {
  const passed = finalPassed(progress);
  return (
    <>
      {home}
      <h2>Stage 9: Final exam</h2>
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
      </section>
    </>
  );
}
