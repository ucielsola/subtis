import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu({
  rules: {
    'curly': 0,
    'no-nested-ternary': 0,
    'node/prefer-global/buffer': 0,
    'node/prefer-global/process': 0,
    'ts/consistent-type-definitions': 0,
  },
}, ...compat.config({
  extends: ['plugin:perfectionist/recommended-natural'],
  rules: {
    'perfectionist/sort-imports': 0,
  },
}))
