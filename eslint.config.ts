import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'curly': 0,
    'no-nested-ternary': 0,
    'node/prefer-global/process': 0,
    'ts/consistent-type-definitions': 0,
  },
})
