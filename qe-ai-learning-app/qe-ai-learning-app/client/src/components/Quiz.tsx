import { useState } from 'react';
import type { StageTestQuestion } from '../content/course';

type Result = { score: number; total: number; percent: number };
type Props = {
  questions: StageTestQuestion[];
  submitLabel: string;
  onSubmit?: (r: Result) => void;
  passPercent?: number | null;
  disabledReason?: string;
};

export function Quiz({ questions, submitLabel, onSubmit, passPercent, disabledReason }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const allAnswered = questions.every((x) => answers[x.id] !== undefined);

  function submit() {
    // Deterministic grading from fixed answer keys. No LLM involved.
    const total = questions.reduce((n, x) => n + x.marks, 0);
    const score = questions.reduce((n, x) => n + (answers[x.id] === x.answerIndex ? x.marks : 0), 0);
    const r = { score, total, percent: Math.round((score / total) * 100) };
    setResult(r);
    onSubmit?.(r);
  }

  if (disabledReason) return <p className="notice">{disabledReason}</p>;

  return (
    <div>
      {questions.map((x, i) => (
        <fieldset key={x.id} disabled={result !== null}>
          <legend>{i + 1}. {x.question} ({x.marks} {x.marks === 1 ? 'mark' : 'marks'})</legend>
          {x.options.map((o, oi) => (
            <label key={oi} className="option">
              <input type="radio" name={x.id} checked={answers[x.id] === oi} onChange={() => setAnswers({ ...answers, [x.id]: oi })} />
              {o}
            </label>
          ))}
          {result && (
            <p className="feedback">
              {answers[x.id] === x.answerIndex ? '✔ Correct.' : `✘ Incorrect. Correct answer: ${x.options[x.answerIndex]}.`} {x.rationale}
            </p>
          )}
        </fieldset>
      ))}
      {!result ? (
        <button onClick={submit} disabled={!allAnswered}>{submitLabel}</button>
      ) : (
        <div role="status">
          <p><strong>Score: {result.score} / {result.total} ({result.percent}%)</strong>
            {passPercent != null && (result.percent >= passPercent ? ' - Passed.' : ` - Not passed. ${passPercent}% needed.`)}</p>
          <button onClick={() => { setAnswers({}); setResult(null); }}>Retake</button>
        </div>
      )}
    </div>
  );
}
