import type { AudioTrack } from '../types/audio'

export function isAudioTrack(value: unknown): value is AudioTrack {
  if (!value || typeof value !== 'object') {
    return false
  }

  const track = value as AudioTrack
  return (
    typeof track.name === 'string' &&
    track.name.trim().length > 0 &&
    typeof track.file === 'string' &&
    track.file.trim().length > 0
  )
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '--:--:--'
  }

  const wholeSeconds = Math.floor(seconds)
  const hours = Math.floor(wholeSeconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((wholeSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const remainingSeconds = (wholeSeconds % 60).toString().padStart(2, '0')

  return `${hours}:${minutes}:${remainingSeconds}`
}
