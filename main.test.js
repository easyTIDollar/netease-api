const assert = require('assert')
const main = require('./main')

describe('methods in server.js', () => {
  it('has serveNcmApi', () => {
    assert.strictEqual(typeof main.serveNcmApi, 'function')
  })

  it('has getModulesDefinitions', () => {
    assert.strictEqual(typeof main.getModulesDefinitions, 'function')
  })
})

describe('methods in module', () => {
  it('has activate_init_profile', () => {
    assert.strictEqual(typeof main.activate_init_profile, 'function')
  })
})

describe('artist_sub module', () => {
  const artistSub = require('./module/artist_sub')

  it('only sends artistId when subscribing', async () => {
    const request = (uri, data, options) => ({ uri, data, options })
    const result = await artistSub({ id: 1203003, t: 1 }, request)

    assert.strictEqual(result.uri, '/api/artist/sub')
    assert.deepStrictEqual(result.data, { artistId: 1203003 })
    assert.strictEqual(result.options.crypto, 'weapi')
  })

  it('sends artistIds when unsubscribing', async () => {
    const request = (uri, data, options) => ({ uri, data, options })
    const result = await artistSub({ id: 1203003, t: 0 }, request)

    assert.strictEqual(result.uri, '/api/artist/unsub')
    assert.deepStrictEqual(result.data, {
      artistId: 1203003,
      artistIds: '[1203003]',
    })
    assert.strictEqual(result.options.crypto, 'weapi')
  })

  it('removes mobile device fields before making a weapi request', async () => {
    const request = (uri, data, options) => ({ uri, data, options })
    const result = await artistSub(
      {
        id: 1203003,
        t: 1,
        cookie: {
          MUSIC_U: 'present',
          __csrf: 'present',
          os: 'android',
          appver: '9.4.32',
          deviceId: 'device-id',
        },
      },
      request,
    )

    assert.deepStrictEqual(result.options.cookie, {
      MUSIC_U: 'present',
      __csrf: 'present',
    })
  })

  it('treats an already-matching subscription state as success', async () => {
    const request = async (uri) => {
      if (uri === '/api/artist/sub') {
        throw {
          status: 250,
          body: { code: 250, message: '参数错误' },
        }
      }
      return {
        status: 200,
        body: { code: 200, data: { isFollow: true } },
        cookie: [],
      }
    }

    const result = await artistSub(
      {
        id: 1203003,
        t: 1,
        cookie: { MUSIC_U: 'present', __csrf: 'present' },
      },
      request,
    )

    assert.strictEqual(result.status, 200)
    assert.deepStrictEqual(result.body, {
      code: 200,
      message: 'ok',
      followed: true,
      idempotent: true,
    })
  })
})
