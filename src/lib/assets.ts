function appBasePath(): string {
  return import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
}

export function publicAssetPath(path: string): string {
  return `${appBasePath()}${path}`
}

export function ambientAudioPath(file: string): string {
  const safePath = file
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return publicAssetPath(`audio/${safePath}`)
}
