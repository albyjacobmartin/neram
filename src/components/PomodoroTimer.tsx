import {
  formatTimerTime,
  getSessionLabel,
  type SessionType,
} from '../lib/pomodoro'
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from './Icons'

interface PomodoroTimerProps {
  sessionType: SessionType
  remainingSeconds: number
  durationSeconds: number
  completedWorkSessions: number
  isRunning: boolean
  onStartOrResume: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onSessionSelect: (sessionType: SessionType) => void
}

const RING_SIZE = 280
const RING_STROKE = 4
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const accentBySession: Record<SessionType, string> = {
  work: '#7c5cfc',
  shortBreak: '#34d399',
  longBreak: '#60a5fa',
}

export default function PomodoroTimer({
  sessionType,
  remainingSeconds,
  durationSeconds,
  completedWorkSessions,
  isRunning,
  onStartOrResume,
  onPause,
  onReset,
  onSkip,
  onSessionSelect,
}: PomodoroTimerProps) {
  const progress = Math.max(0, Math.min(1, remainingSeconds / durationSeconds))
  const sessionLabel = getSessionLabel(sessionType)
  const sessionNumber =
    sessionType === 'work'
      ? completedWorkSessions + 1
      : Math.max(1, completedWorkSessions)
  const buttonLabel = isRunning
    ? 'Pause'
    : remainingSeconds === durationSeconds
      ? 'Start'
      : 'Resume'
  const activeMode =
    sessionType === 'work'
      ? 'Pomodoro'
      : sessionType === 'shortBreak'
        ? 'Short Break'
        : 'Long Break'
  const visualSessionLabel = sessionType === 'work' ? 'Focus' : sessionLabel

  return (
    <section className="timer-section" aria-label="Pomodoro timer">
      <div className="mode-selector" aria-label={`${sessionLabel}, session ${sessionNumber}`}>
        {(
          [
            ['Pomodoro', 'work'],
            ['Short Break', 'shortBreak'],
            ['Long Break', 'longBreak'],
          ] as const
        ).map(([mode, targetSession]) => (
          <button
            key={mode}
            type="button"
            className={`mode-selector__item${mode === activeMode ? ' mode-selector__item--active' : ''}`}
            onClick={() => onSessionSelect(targetSession)}
            aria-pressed={mode === activeMode}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="timer-visual">
        <svg
          className="timer-ring"
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          role="img"
          aria-label={`${Math.round(progress * 100)} percent remaining`}
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            className="timer-ring__track"
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            className="timer-ring__progress"
            stroke={accentBySession[sessionType]}
            strokeWidth={RING_STROKE}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <div className="timer-visual__content">
          <time className="timer-time" aria-live="polite">
            {formatTimerTime(remainingSeconds)}
          </time>
          <span className="timer-label">{visualSessionLabel}</span>
          <span className="visually-hidden">
            {sessionLabel}, session {sessionNumber}
          </span>
        </div>
      </div>

      <div className="timer-controls">
        <button
          className="icon-button"
          type="button"
          onClick={onReset}
          aria-label="Reset Pomodoro timer"
          title="Reset"
        >
          <ResetIcon width="17" height="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={isRunning ? onPause : onStartOrResume}
          aria-label={buttonLabel + ' Pomodoro timer'}
        >
          {isRunning ? <PauseIcon width="16" height="16" /> : <PlayIcon width="16" height="16" />}
          {buttonLabel}
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={onSkip}
          aria-label="Skip this session"
          title="Skip session"
        >
          <SkipIcon width="17" height="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>
    </section>
  )
}
