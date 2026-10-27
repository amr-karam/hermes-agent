import sharedConfig from '../../eslint.config.shared.mjs'

export default [
  ...sharedConfig,
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'src/**/*.js', '**/package-lock.json', '**/*.generated.ts']
  }
]