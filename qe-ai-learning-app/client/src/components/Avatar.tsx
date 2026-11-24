export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const LABELS: Record<AvatarState, string> = {
  idle: 'Tutor is idle', listening: 'Tutor is listening', thinking: 'Tutor is thinking',
  speaking: 'Tutor is speaking', error: 'Tutor has a problem',
};

export function Avatar({ state }: { state: AvatarState }) {
  return (
    <div className={`avatar avatar-${state}`} data-state={state}>
      <img src="/images/avatar-nova.svg" width="72" height="72" alt={LABELS[state]} />
      <span className="avatar-label">{LABELS[state]}</span>
    </div>
  );
}
