import { useCallback, useEffect, useRef } from 'react'
import AudioPlayer from './components/AudioPlayer'
import FocusQueue from './components/FocusQueue'
import PomodoroTimer from './components/PomodoroTimer'
import { usePomodoro } from './hooks/usePomodoro'
import { publicAssetPath } from './lib/assets'

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/albyjacobmartin',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="currentColor">
        <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.33-1.77-1.33-1.77-1.09-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.07 1.84 2.8 1.31 3.48.99.11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.9 0-1.3.46-2.37 1.22-3.2-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6.01 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.76.83 1.22 1.9 1.22 3.2 0 4.58-2.82 5.59-5.5 5.88.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/albyjacobmartin/',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="currentColor">
        <path d="M6.94 8.5A1.5 1.5 0 1 1 6.93 5.5a1.5 1.5 0 0 1 .01 3Zm-1.34 1.2h2.67V18H5.6V9.7Zm4.55 0h2.56v1.13h.04c.36-.68 1.23-1.39 2.53-1.39 2.71 0 3.21 1.78 3.21 4.09V18h-2.67v-16? no, keep same" />
      </svg>
    ),
  },
]

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

      <div className="social-links" aria-label="Social links">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="social-link"
            aria-label={link.label}
            title={link.label}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </main>
  )
}
