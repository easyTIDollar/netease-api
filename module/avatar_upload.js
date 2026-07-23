const uploadPlugin = require('../plugins/upload')
const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const uploadInfo = await uploadPlugin(query, request)
  const data = {
    imgid: uploadInfo.imgId,
  }
  let res = await request(
    `/api/user/avatar/upload/v1`,
    data,
    createOption(query),
  )
  // Some current accounts reject this endpoint through EAPI with a generic
  // 400, while the legacy WEAPI route still accepts the same cropped image.
  if (res.body.code !== 200) {
    res = await request(
      `/api/user/avatar/upload/v1`,
      data,
      createOption(query, 'weapi'),
    )
  }
  return {
    status: 200,
    body: {
      // Keep the HTTP response compatible with other API modules, but do not
      // disguise an upstream avatar update failure as a successful upload.
      code: res.body.code,
      message: res.body.message || res.body.msg,
      data: {
        ...uploadInfo,
        ...res.body,
      },
    },
  }
}
