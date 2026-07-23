const match = require('@unblockneteasemusic/server')

const DEFAULT_SOURCE_ORDER = ['pyncmd', 'bodian', 'kuwo', 'kugou']
const DEFAULT_MIN_AUDIO_SECONDS = 30

function parseSources(source) {
  if (Array.isArray(source)) return source.filter(Boolean)
  if (typeof source !== 'string' || !source.trim()) return undefined

  return source
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSourceOrder(source) {
  return (
    parseSources(source) ||
    parseSources(process.env.UNBLOCK_SOURCE_ORDER) ||
    DEFAULT_SOURCE_ORDER
  )
}

function getMinAudioSeconds() {
  const value = Number(process.env.UNBLOCK_MIN_AUDIO_SECONDS)
  return Number.isFinite(value) && value >= 0
    ? value
    : DEFAULT_MIN_AUDIO_SECONDS
}

function getEstimatedAudioSeconds(result) {
  if (!result || !result.size || !result.br) return null
  return (result.size * 8) / result.br
}

function assertPlayableResult(result) {
  if (!result || !result.url) {
    throw new Error('No available source found')
  }

  const minAudioSeconds = getMinAudioSeconds()
  const estimatedSeconds = getEstimatedAudioSeconds(result)

  if (estimatedSeconds !== null && estimatedSeconds < minAudioSeconds) {
    throw new Error(
      `Matched audio is too short (${estimatedSeconds.toFixed(1)}s)`,
    )
  }
}

async function matchSong(id, source) {
  const errors = []

  for (const item of getSourceOrder(source)) {
    try {
      const result = await match(id, [item])
      assertPlayableResult(result)
      return result
    } catch (e) {
      errors.push(`${item}: ${e.message || e}`)
    }
  }

  throw new Error(errors.join('; ') || 'No available source found')
}

function createProxyUrl(url) {
  if (!url || !url.includes('kuwo')) return ''
  if (process.env.ENABLE_PROXY === 'true' && process.env.PROXY_URL) {
    return process.env.PROXY_URL + url
  }
  return url
}

module.exports = {
  createProxyUrl,
  getEstimatedAudioSeconds,
  getMinAudioSeconds,
  getSourceOrder,
  matchSong,
  parseSources,
}
