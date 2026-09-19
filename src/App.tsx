import { useCallback, useEffect, useRef } from 'react'
import AudioPlayer from './components/AudioPlayer'
import FocusQueue from './components/FocusQueue'
import PomodoroTimer from './components/PomodoroTimer'
import { usePomodoro } from './hooks/usePomodoro'
import { publicAssetPath } from './lib/assets'

export default function App() {
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const notificationAudio = new Audio()
    notificationAudio.preload = 'none'
    notificationAudio.src = publicAssetPath('audio/notification.mp3')
    notificationAudioRef.current = notificationAudio

    return () => {
      notificationAudio.pause()
      notificationAudio.removeAttribute('src')
      notificationAudio.load()
      notificationAudioRef.current = null
    }
  }, [])

  const playNotification = useCallback(() => {
    const notificationAudio = notificationAudioRef.current
    if (!notificationAudio) {
      return
    }

    notificationAudio.pause()
    notificationAudio.currentTime = 0
    void notificationAudio.play().catch(() => {
      // Browsers can reject delayed playback. The timer must remain reliable.
    })
  }, [])

  const pomodoro = usePomodoro({ onNaturalComplete: playNotification })

  return (
    <main className="app-shell">
      <div className="app-content">
        <PomodoroTimer
          sessionType={pomodoro.sessionType}
          remainingSeconds={pomodoro.remainingSeconds}
          durationSeconds={pomodoro.durationSeconds}
          completedWorkSessions={pomodoro.completedWorkSessions}
          isRunning={pomodoro.isRunning}
          onStartOrResume={pomodoro.startOrResume}
          onPause={pomodoro.pause}
          onReset={pomodoro.reset}
          onSkip={pomodoro.skip}
          onSessionSelect={pomodoro.selectSession}
        />
        <div className="lower-section">
          <AudioPlayer />
          <FocusQueue />
        </div>
      </div>
    </main>
  )
}
