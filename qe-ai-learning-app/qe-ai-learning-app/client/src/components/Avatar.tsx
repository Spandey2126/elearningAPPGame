export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const LABELS: Record<AvatarState, string> = {
  idle: 'Tutor is idle', listening: 'Tutor is listening', thinking: 'Tutor is thinking',
  speaking: 'Tutor is speaking', error: 'Tutor has a problem',
};

export function Avatar({ state }: { state: AvatarState }) {
  return (
    <div className={`avatar avatar-${state}`} data-state={state}>
      <svg viewBox="0 0 100 100" width="72" height="72" role="img" aria-label={LABELS[state]}>
        <circle cx="50" cy="50" r="44" className="av-face" />
        <circle cx="35" cy="42" r="5" className="av-eye" />
        <circle cx="65" cy="42" r="5" className="av-eye" />
        {state === 'error' ? <path d="M33 72 Q50 58 67 72" className="av-mouth" /> :
          state === 'speaking' ? <ellipse cx="50" cy="68" rx="10" ry="7" className="av-mouth av-talk" /> :
          <path d="M33 64 Q50 78 67 64" className="av-mouth" />}
      </svg>
      <span className="avatar-label">{LABELS[state]}</span>
    </div>
  );
}
