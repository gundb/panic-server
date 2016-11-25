'use strict';
var eslint = exports;

eslint.env = {
  node: true,
  commonjs: true,
};

eslint.extends = [
  'eslint:recommended',
  'llama',
];

eslint.rules = {
  'no-var': 'off',
  'prefer-template': 'off',
};
