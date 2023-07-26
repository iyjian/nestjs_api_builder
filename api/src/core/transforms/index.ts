export type TRANSFORMER_TYPES =
  | 'dateTransformer'
  | 'dateTimeTransformer'
  | 'booleanTransformer'
  | 'numberTransformer'

const transformers = {
  dateTransformer: ({ value }) => {
    return value
  },
  dateTimeTransformer: ({ value }) => {
    return value
  },
  booleanTransformer: ({ value }) => {
    if (value === 'true' || value === '1') return true
    if (value === 'false' || value === '0') return false
    return value
  },
  numberTransformer: ({ value }) => {
    return value
  },
}

export function getTransformer(type: TRANSFORMER_TYPES) {
  return transformers[type]
}
