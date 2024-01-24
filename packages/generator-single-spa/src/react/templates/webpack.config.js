const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-exitb-single-spa-react<% if (typescript) { %>-ts<% } %>");

module.exports = (webpackConfigEnv, argv) => {
  const excludeFull = true;
  const defaultConfig = singleSpaDefaults({
    orgName: "<%= orgName %>",
    projectName: "<%= projectName %>",
    webpackConfigEnv,
    argv,
  }, excludeFull);

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
  });
};
