// 收藏与取消收藏歌手

const createOption = require('../util/option.js')
const logger = require('../util/logger.js')

const createWebOption = (query) => {
  const cookie = { ...(query.cookie || {}) }
  ;[
    'os',
    'osver',
    'appver',
    'channel',
    'versioncode',
    'deviceId',
    'sDeviceId',
    'mobilename',
    'resolution',
    'buildver',
  ].forEach((key) => delete cookie[key])
  return createOption({ ...query, cookie }, 'weapi')
}

module.exports = async (query, request) => {
  const subscribing = query.t == 1
  const action = subscribing ? 'sub' : 'unsub'
  const data = { artistId: query.id }
  if (!subscribing) {
    data.artistIds = '[' + query.id + ']'
  }
  try {
    return await request(`/api/artist/${action}`, data, createWebOption(query))
  } catch (error) {
    const cookie = query.cookie || {}
    let followed
    if (error.status === 250) {
      try {
        const followResponse = await request(
          `/api/artist/follow/count/get`,
          { id: query.id },
          createWebOption(query),
        )
        followed = Boolean(
          followResponse.body?.data?.isFollow ||
          followResponse.body?.data?.follow,
        )
      } catch (followError) {
        logger.error('Failed to verify artist subscription state', {
          artistId: query.id,
          upstreamStatus: followError.status,
          upstreamBody: followError.body,
        })
      }
    }
    logger.error('Artist subscription upstream request failed', {
      action,
      artistId: query.id,
      hasMusicU: Boolean(cookie.MUSIC_U),
      hasCsrf: Boolean(cookie.__csrf),
      followed,
      upstreamStatus: error.status,
      upstreamBody: error.body,
    })
    if (followed === subscribing) {
      return {
        status: 200,
        body: { code: 200, message: 'ok', followed, idempotent: true },
        cookie: [],
      }
    }
    throw error
  }
}
