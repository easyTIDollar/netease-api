const { default: axios } = require('axios')
const createOption = require('../util/option.js')
const { getUploadData } = require('../util/fileHelper')
const { cookieObjToString, cookieToJson } = require('../util')

module.exports = async (query, request) => {
  const data = {
    bucket: 'yyimgs',
    ext: 'jpg',
    filename: query.imgFile.name,
    local: false,
    nos_product: 0,
    return_body: `{"code":200,"size":"$(ObjectSize)"}`,
    type: 'other',
  }
  const res = await request(
    `/api/nos/token/alloc`,
    data,
    createOption(query, 'weapi'),
  )

  const res2 = await axios({
    method: 'post',
    url: `https://nosup-hz1.127.net/yyimgs/${res.body.result.objectKey}?offset=0&complete=true&version=1.0`,
    headers: {
      'x-nos-token': res.body.result.token,
      'Content-Type': query.imgFile.mimetype || 'image/jpeg',
    },
    data: getUploadData(query.imgFile),
  })

  // NOS only stores the original file. The avatar endpoint requires the id of
  // the cropped image returned by this request, not the allocation docId.
  const imgSize = Number(query.imgSize) || 300
  const imgX = Number(query.imgX) || 0
  const imgY = Number(query.imgY) || 0
  const cookie =
    typeof query.cookie === 'string' ? cookieToJson(query.cookie) : query.cookie
  const cropResponse = await axios({
    method: 'get',
    url: 'https://music.163.com/upload/img/op',
    params: {
      id: res.body.result.docId,
      op: `${imgX}y${imgY}y${imgSize}y${imgSize}`,
    },
    headers: {
      Cookie: cookieObjToString(cookie || {}),
      Referer: 'https://music.163.com/',
      'User-Agent':
        query.ua ||
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    },
  })

  if (
    (cropResponse.data?.code && cropResponse.data.code !== 200) ||
    !cropResponse.data?.id
  ) {
    throw new Error(
      cropResponse.data?.message || 'Failed to crop uploaded image',
    )
  }

  return {
    url_pre:
      cropResponse.data.url ||
      'https://p1.music.126.net/' + res.body.result.objectKey,
    imgId: cropResponse.data.id,
  }
}
