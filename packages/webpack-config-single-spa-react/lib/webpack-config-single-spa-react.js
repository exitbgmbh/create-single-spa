const webpackConfigSingleSpa = require("webpack-config-single-spa");

module.exports = webpackConfigSingleSpaReact;

const alwaysExternalPackages = [
    'react',
    'react-dom',
    'react-router-dom',
    'react-hook-form',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/styled',
    '@emotion/react',
    'react-i18next',
    'i18next',
    'i18next-resources-to-backend',
    'moment',
    'uuid'
]

const conditionalExternalPackages = [
  '@mui/x-license-pro',
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
]

function webpackConfigSingleSpaReact(opts, excludeConditionalPackages = true) {
  const webpackConfigEnv = opts.webpackConfigEnv || {};

  opts.react = true;
  const config = webpackConfigSingleSpa(opts);

  if (!webpackConfigEnv.standalone) {
    config.externals = [
        ...config.externals,
        ...alwaysExternalPackages
    ]

    if (excludeConditionalPackages) {
      config.externals = [
          ...config.externals,
          ...conditionalExternalPackages
      ]
    }
  }

  return config;
}
