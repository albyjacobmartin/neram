export type SessionType = 'work' | 'shortBreak' | 'longBreak'

export interface PomodoroConfig {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

export interface SessionTransition {
  sessionType: SessionType
  completedWorkSessions: number
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 50 * 60,
  shortBreakDuration: 10 * 60,
  longBreakDuration: 25 * 60,
  sessionsUntilLongBreak: 4,
}

export function getSessionDuration(
  sessionType: SessionType,
  config: PomodoroConfig = DEFAULT_POMODORO_CONFIG,
): number {
  switch (sessionType) {
    case 'work':
      return config.workDuration
    case 'shortBreak':
      return config.shortBreakDuration
    case 'longBreak':
      return config.longBreakDuration
  }
}

export function getSessionLabel(sessionType: SessionType): string {
  switch (sessionType) {
    case 'work':
      return 'Work'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
  }
}

/**
 * Resolves the next phase without storing UI concerns in the timer engine.
 * Advancing a work block, whether it ends naturally or is manually skipped,
 * counts toward the long-break cadence.
 */
export function getNextSession(
  currentSession: SessionType,
  completedWorkSessions: number,
  countCompletedWorkSession: boolean,
  config: PomodoroConfig = DEFAULT_POMODORO_CONFIG,
): SessionTransition {
  if (currentSession !== 'work') {
    return { sessionType: 'work', completedWorkSessions }
  }

  const nextCompletedWorkSessions = countCompletedWorkSession
    ? completedWorkSessions + 1
    : completedWorkSessions
  const isLongBreak =
    nextCompletedWorkSessions > 0 &&
    nextCompletedWorkSessions % config.sessionsUntilLongBreak === 0

  return {
    sessionType: isLongBreak ? 'longBreak' : 'shortBreak',
    completedWorkSessions: nextCompletedWorkSessions,
  }
}

export function formatTimerTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0')
  const seconds = (safeSeconds % 60).toString().padStart(2, '0')

  return `${minutes}:${seconds}`
}
