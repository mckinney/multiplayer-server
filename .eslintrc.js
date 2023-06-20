// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: ['airbnb-base'],
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      js: 'never'
    }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'state', // for vuex state
        'acc', // for reduce accumulators
        'e' // for e.returnvalue
      ]
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      optionalDependencies: ['test/unit/index.js']
    }],
    "no-tabs": 0,
    "quotes": 0,
    "indent": ["error",
	  "tab",
	  { "ignoreComments": true }
    ],
    "radix": ["error", "as-needed"],
    // allow debugger during development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
	'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
	'max-len': ['error', 105, 2, {
		tabWidth: 4,
		ignoreUrls: true,
		ignoreComments: false,
		ignoreRegExpLiterals: true,
		ignoreStrings: true,
		ignoreTemplateLiterals: true,
	  }],
  }
}
