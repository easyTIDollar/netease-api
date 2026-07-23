// 网易云歌曲解灰(适配SPlayer的UNM-Server)
// 支持qq音乐、酷狗音乐、酷我音乐、咪咕音乐、第三方网易云API等等(来自GD音乐台)

const logger = require('../util/logger.js')
const { createProxyUrl, matchSong } = require('../util/unblock.js')

module.exports = async (query, request) => {
  try {
    const result = await matchSong(query.id, query.source)
    logger.info('开始解灰', query.id, result)
    return {
      status: 200,
      body: {
        code: 200,
        data: result.url,
        proxyUrl: createProxyUrl(result.url),
      },
    }
  } catch (e) {
    return {
      status: 500,
      body: {
        code: 500,
        msg: e.message || 'unblock error',
        data: [],
      },
    }
  }
}
