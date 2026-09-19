import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { AudioTrack } from '../types/audio'
import {
  ChevronRightIcon,
  CloseIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
} from './Icons'
import { ambientAudioPath, publicAssetPath } from '../lib/assets'
import { formatAudioTime, isAudioTrack } from '../lib/audio'

function AudioPlayer() {
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [selectedFile, setSelectedFile] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isManifestLoading, setIsManifestLoading] = useState(true)
  const [isMetadataLoading, setIsMetadataLoading] = useState(false)
  const [manifestError, setManifestError] = useState<string | null>(null)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const selectedTrack = tracks.find((track) => track.file === selectedFile)
  const progress = duration && duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const controller = new AbortController()

    async function loadManifest() {
      try {
        const response = await fetch(publicAssetPath('audio.json'), {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Audio manifest request failed (${response.status})`)
        }

        const data: unknown = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Audio manifest must be an array')
        }

        const availableTracks = data.filter(isAudioTrack).filter((track) => {
          return track.file.toLowerCase() !== 'notification.mp3'
        })
        setTracks(availableTracks)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setManifestError('Unable to load ambient tracks. Please try again later.')
      } finally {
        if (!controller.signal.aborted) {
          setIsManifestLoading(false)
        }
      }
    }

    void loadManifest()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!pickerOpen) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPickerOpen(false)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [pickerOpen])

  const updateDuration = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) {
      return
    }

    setDuration(audio.duration)
    setIsMetadataLoading(false)
  }, [])

  const handleTrackChange = useCallback(
    (file: string) => {
      const track = tracks.find((candidate) => candidate.file === file)
      const audio = audioRef.current
      if (!track || !audio) {
        return
      }

      audio.pause()
      audio.currentTime = 0
      audio.src = ambientAudioPath(track.file)
      audio.load()

      setSelectedFile(track.file)
      setCurrentTime(0)
      setDuration(null)
      setIsPlaying(false)
      setIsMetadataLoading(true)
      setPlayerError(null)
    },
    [tracks],
  )

  const selectTrack = useCallback(
    (file: string) => {
      handleTrackChange(file)
      setPickerOpen(false)
    },
    [handleTrackChange],
  )

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !selectedTrack) {
      return
    }

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    if (audio.ended || (duration !== null && audio.currentTime >= duration)) {
      audio.currentTime = 0
      setCurrentTime(0)
    }

    try {
      await audio.play()
      setIsPlaying(true)
      setPlayerError(null)
    } catch {
      setIsPlaying(false)
      setPlayerError('Audio could not start. Check the file and try again.')
    }
  }, [duration, isPlaying, selectedTrack])

  return (
    <section className="audio-card" aria-labelledby="soundscape-title">
      <div className="audio-card__heading">
        <h2 id="soundscape-title">Soundscape</h2>
      </div>

      <div className="audio-picker-row">
        <button
          className="audio-picker-trigger"
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-label="Choose ambient audio track"
        >
          <span className="audio-picker-trigger__content">
            <MusicIcon
              width="13"
              height="13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <span>{selectedTrack?.name ?? 'Choose a track…'}</span>
          </span>
          <ChevronRightIcon
            width="15"
            height="15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </button>
        <button
          className="audio-play-button"
          type="button"
          onClick={() => void togglePlayback()}
          disabled={!selectedTrack}
          aria-label={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon width="14" height="14" /> : <PlayIcon width="14" height="14" />}
        </button>
      </div>

      <div className="audio-progress-group">
        <div
          className="audio-progress"
          role="progressbar"
          aria-label="Ambient audio progress"
          aria-valuemin={0}
          aria-valuemax={duration ?? 0}
          aria-valuenow={Math.min(currentTime, duration ?? 0)}
        >
          <span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
        <div className="audio-timecodes" aria-live="polite">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{isMetadataLoading ? 'Loading…' : formatAudioTime(duration ?? Number.NaN)}</span>
        </div>
      </div>

      {(manifestError || playerError) && (
        <p className="audio-error" role="status">
          {manifestError ?? playerError}
        </p>
      )}

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={updateDuration}
        onDurationChange={updateDuration}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={(event) => {
          setCurrentTime(event.currentTarget.duration)
          setIsPlaying(false)
        }}
        onError={() => {
          setIsPlaying(false)
          setIsMetadataLoading(false)
          setPlayerError('This audio file could not be loaded. Try another track.')
        }}
      />

      {pickerOpen && (
        <div
          className="audio-picker-overlay"
          role="presentation"
          onMouseDown={() => setPickerOpen(false)}
        >
          <div
            className="audio-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audio-picker-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="audio-picker-dialog__header">
              <h3 id="audio-picker-title">Choose a Track</h3>
              <button
                className="audio-picker-dialog__close"
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Close track picker"
              >
                <CloseIcon
                  width="13"
                  height="13"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </button>
            </div>
            <div className="audio-picker-dialog__body">
              {isManifestLoading && <p className="audio-picker-empty">Loading tracks…</p>}
              {manifestError && <p className="audio-picker-empty">Unable to load tracks.</p>}
              {!isManifestLoading && !manifestError && tracks.length === 0 && (
                <p className="audio-picker-empty">No ambient tracks available.</p>
              )}
              {tracks.length > 0 && (
                <div className="audio-picker-group">
                  <p>Available tracks</p>
                  <div className="audio-picker-grid">
                    {tracks.map((track) => {
                      const isActive = selectedTrack?.file === track.file
                      return (
                        <button
                          key={track.file}
                          className={`audio-picker-option${isActive ? ' audio-picker-option--active' : ''}`}
                          type="button"
                          onClick={() => selectTrack(track.file)}
                        >
                          <span className="audio-picker-option__dot" />
                          <span>{track.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default memo(AudioPlayer)
