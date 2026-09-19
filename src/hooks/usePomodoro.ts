import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_POMODORO_CONFIG,
  getNextSession,
  getSessionDuration,
  type PomodoroConfig,
  type SessionType,
} from '../lib/pomodoro'

interface UsePomodoroOptions {
  config?: PomodoroConfig
  onNaturalComplete?: () => void
}

export interface PomodoroController {
  sessionType: SessionType
  remainingSeconds: number
  durationSeconds: number
  completedWorkSessions: number
  isRunning: boolean
  startOrResume: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  selectSession: (sessionType: SessionType) => void
}

/**
 * A deadline-driven Pomodoro engine. The deadline, not a decrementing counter,
 * is the authoritative source of elapsed time.
 */
export function usePomodoro({
  config = DEFAULT_POMODORO_CONFIG,
  onNaturalComplete,
}: UsePomodoroOptions = {}): PomodoroController {
  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [remainingSeconds, setRemainingSeconds] = useState(config.workDuration)
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const deadlineRef = useRef<number | null>(null)
  const sessionTypeRef = useRef<SessionType>('work')
  const remainingSecondsRef = useRef(config.workDuration)
  const completedWorkSessionsRef = useRef(0)
  const isRunningRef = useRef(false)
  const onNaturalCompleteRef = useRef(onNaturalComplete)

  useEffect(() => {
    onNaturalCompleteRef.current = onNaturalComplete
  }, [onNaturalComplete])

  const publishState = useCallback(
    (
      nextSessionType: SessionType,
      nextRemainingSeconds: number,
      nextCompletedWorkSessions: number,
      nextIsRunning: boolean,
    ) => {
      sessionTypeRef.current = nextSessionType
      remainingSecondsRef.current = nextRemainingSeconds
      completedWorkSessionsRef.current = nextCompletedWorkSessions
      isRunningRef.current = nextIsRunning

      setSessionType((current) =>
        current === nextSessionType ? current : nextSessionType,
      )
      setRemainingSeconds((current) =>
        current === nextRemainingSeconds ? current : nextRemainingSeconds,
      )
      setCompletedWorkSessions((current) =>
        current === nextCompletedWorkSessions
          ? current
          : nextCompletedWorkSessions,
      )
      setIsRunning((current) =>
        current === nextIsRunning ? current : nextIsRunning,
      )
    },
    [],
  )

  const tick = useCallback(() => {
    if (!isRunningRef.current || deadlineRef.current === null) {
      return
    }

    const now = Date.now()
    let nextDeadline = deadlineRef.current
    let nextSessionType = sessionTypeRef.current
    let nextCompletedWorkSessions = completedWorkSessionsRef.current
    let completedOneOrMoreSessions = false

    // Carry a late tick forward from the prior deadline. This keeps the timer
    // accurate if the browser throttles it while a tab is in the background.
    while (now >= nextDeadline) {
      const transition = getNextSession(
        nextSessionType,
        nextCompletedWorkSessions,
        true,
        config,
      )
      nextSessionType = transition.sessionType
      nextCompletedWorkSessions = transition.completedWorkSessions
      nextDeadline += getSessionDuration(nextSessionType, config) * 1000
      completedOneOrMoreSessions = true
    }

    const nextRemainingSeconds = Math.max(
      0,
      Math.ceil((nextDeadline - now) / 1000),
    )
    deadlineRef.current = nextDeadline

    publishState(
      nextSessionType,
      nextRemainingSeconds,
      nextCompletedWorkSessions,
      true,
    )

    // A single notification is the useful, non-overlapping outcome if a
    // throttled tab crossed more than one boundary before it resumed.
    if (completedOneOrMoreSessions) {
      onNaturalCompleteRef.current?.()
    }
  }, [config, publishState])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    tick()
    const intervalId = window.setInterval(tick, 500)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tick()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning, tick])

  const startOrResume = useCallback(() => {
    if (isRunningRef.current) {
      return
    }

    deadlineRef.current = Date.now() + remainingSecondsRef.current * 1000
    publishState(
      sessionTypeRef.current,
      remainingSecondsRef.current,
      completedWorkSessionsRef.current,
      true,
    )
  }, [publishState])

  const pause = useCallback(() => {
    if (!isRunningRef.current || deadlineRef.current === null) {
      return
    }

    const nextRemainingSeconds = Math.max(
      0,
      Math.ceil((deadlineRef.current - Date.now()) / 1000),
    )

    if (nextRemainingSeconds === 0) {
      tick()
      return
    }

    deadlineRef.current = null
    publishState(
      sessionTypeRef.current,
      nextRemainingSeconds,
      completedWorkSessionsRef.current,
      false,
    )
  }, [publishState, tick])

  const reset = useCallback(() => {
    deadlineRef.current = null
    const currentSession = sessionTypeRef.current
    publishState(
      currentSession,
      getSessionDuration(currentSession, config),
      completedWorkSessionsRef.current,
      false,
    )
  }, [config, publishState])

  const skip = useCallback(() => {
    const transition = getNextSession(
      sessionTypeRef.current,
      completedWorkSessionsRef.current,
      true,
      config,
    )
    const nextDuration = getSessionDuration(transition.sessionType, config)

    deadlineRef.current = null
    publishState(
      transition.sessionType,
      nextDuration,
      transition.completedWorkSessions,
      false,
    )
  }, [config, publishState])

  const selectSession = useCallback(
    (nextSessionType: SessionType) => {
      deadlineRef.current = null
      publishState(
        nextSessionType,
        getSessionDuration(nextSessionType, config),
        completedWorkSessionsRef.current,
        false,
      )
    },
    [config, publishState],
  )

  return {
    sessionType,
    remainingSeconds,
    durationSeconds: getSessionDuration(sessionType, config),
    completedWorkSessions,
    isRunning,
    startOrResume,
    pause,
    reset,
    skip,
    selectSession,
  }
}
