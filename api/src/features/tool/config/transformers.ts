/**
 * 定义有哪些transformer，需要在TransformerService里实现
 */

export default {
  epochStrToDateStr: {
    name: 'epoch转日期',
    func: 'epochStrToDateStr',
    params: {},
  },
  toJSON: {
    name: 'JSON格式化',
    func: 'toJSON',
    params: {},
  },
  toImgBase64: {
    name: 'base64转图片',
    func: 'toImgBase64',
    params: {},
  },
  // decipherIV: {
  //   name: '解密',
  //   func: 'decipherIV',
  //   params: {
  //     method: {
  //       name: '方法',
  //       type: 'string',
  //     },
  //     key: {
  //       name: 'key',
  //       type: 'string',
  //     },
  //     iv: {
  //       name: 'iv',
  //       type: 'string',
  //     },
  //   },
  // },
}
