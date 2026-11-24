import { useEffect, useRef, useState } from 'react';
import { Avatar, type AvatarState } from './Avatar';
import { askTutor, type TutorResponse } from '../services/tutor';

export function TutorPanel({ lessonTitle, lessonText, guide = 'nova' }: { lessonTitle: string; lessonText: string; guide?: string }) {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<AvatarState>('idle');
  const [reply, setReply] = useState<TutorResponse | null>(null);
  const [error, setError] = useState('');
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const excerpt = lessonText.slice(0, 1500);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; window.speechSynthesis?.cancel(); };
  }, []);

  async function ask() {
    setError(''); setReply(null); setState('thinking');
    try {
      const r = await askTutor({ lessonTitle, lessonText: excerpt, question });
      if (!mounted.current) return;
      setReply(r); setState('idle');
    } catch (e) {
      if (!mounted.current) return;
      setError((e as Error).message); setState('error');
    }
  }

  function speak() {
    if (!reply || !canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(reply.answer);
    u.onend = () => mounted.current && setState('idle');
    u.onerror = () => mounted.current && setState('idle');
    setState('speaking');
    window.speechSynthesis.speak(u);
  }

  function stop() { window.speechSynthesis?.cancel(); setState('idle'); }

  return (
    <section aria-label="AI tutor" className="tutor">
      <h4>Ask the AI tutor (optional, outside the course time estimate)</h4>
      <Avatar state={state} guide={guide} />
      <label htmlFor={`q-${lessonTitle}`}>Your question about this lesson</label>
      <textarea id={`q-${lessonTitle}`} value={question} maxLength={500} rows={2}
        onFocus={() => state === 'idle' && setState('listening')}
        onBlur={() => state === 'listening' && setState('idle')}
        onChange={(e) => setQuestion(e.target.value)} />
      <button onClick={ask} disabled={!question.trim() || state === 'thinking'}>Ask tutor</button>
      <p role="status" className="notice">{state === 'thinking' ? 'Thinking…' : ''}</p>
      {error && (
        <div role="alert" className="error">
          <p>{error}</p>
          <p>Setup: install Ollama, run <code>ollama pull llama3:latest</code>, then <code>ollama serve</code>. The rest of the course still works.</p>
        </div>
      )}
      {reply && (
        <div className="reply">
          <p><strong>AI-generated answer</strong> ({reply.model}). Not verified; the lesson text is authoritative.</p>
          <p className="answer">{reply.answer}</p>
          <details><summary>Lesson context used</summary><p className="answer">{excerpt}</p></details>
          {canSpeak ? (
            <p><button onClick={speak}>Speak</button> <button onClick={stop}>Stop</button></p>
          ) : <p className="notice">Speech is not supported in this browser. Read the answer above.</p>}
        </div>
      )}
    </section>
  );
}
