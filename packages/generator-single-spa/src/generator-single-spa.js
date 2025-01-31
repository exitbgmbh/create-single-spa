const path = require("path");
const Generator = require("yeoman-generator");

// https://github.com/yeoman/generator/releases/tag/v5.0.0
Object.assign(
  Generator.prototype,
  require("yeoman-generator/lib/actions/install")
);

const SingleSpaReactGenerator = require("./react/generator-single-spa-react");
const SingleSpaRootConfigGenerator = require("./root-config/generator-root-config");
const SingleSpaVueGenerator = require("./vue/generator-single-spa-vue");
const SingleSpaAngularGenerator = require("./angular/generator-single-spa-angular");
const SingleSpaUtilModuleGenerator = require("./util-module/generator-single-spa-util-module");
const SingleSpaSvelteGenerator = require("./svelte/generator-single-spa-svelte");
const versionUpdateCheck = require("./version-update-check");
const { version, remoteVersion } = require("../package.json");
const ReactUtilModuleGenerator = require("./util-module/generator-react-util-module");

module.exports = class SingleSpaGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option("dir", {
      type: String,
    });

    this.option("framework", {
      type: String,
    });

    this.option("moduleType", {
      type: String,
    });

    this.option("skipInstall", {
      type: Boolean,
    });

    if (args.length > 0 && !this.options.dir) {
      this.options.dir = args[0];
    }

    Object.keys(this.options).forEach((optionKey) => {
      if (this.options[optionKey] === "false") this.options[optionKey] = false;
    });
  }
  checkRemoteVersion = () => {
    const { stdout } = this.spawnCommandSync(
        "npm",
        ["view", "create-single-spa@latest", "version"],
        { stdio: "pipe" }
    );

    const remoteVersionLatest = stdout
        && stdout.toString
        && stdout.toString("utf8").trim();

    if (remoteVersionLatest) versionUpdateCheck(remoteVersion, remoteVersionLatest);
  }
  checkExitBVersion = () => {
    const { stdout } = this.spawnCommandSync(
        "npm",
        ["view", "exitb-create-single-spa@latest", "version"],
        { stdio: "pipe" }
    );

    const versionLatest = stdout
        && stdout.toString
        && stdout.toString("utf8").trim();

    if (versionLatest) versionUpdateCheck(version, versionLatest, 'exitb-');
  }
  initializing() {
    this.checkExitBVersion();
    this.checkRemoteVersion();
  }
  async chooseDestinationDir() {
    if (!this.options.dir) {
      const response = await this.prompt([
        {
          type: "input",
          name: "dir",
          message: "Directory for new project",
          default: ".",
        },
      ]);

      this.options.dir = response.dir;
    }
  }
  async composeChildGenerator() {
    let moduleType = this.options.moduleType;

    if (!moduleType && this.options.framework) {
      moduleType = "app-parcel";
    }

    if (!moduleType) {
      moduleType = (
        await this.prompt([
          {
            type: "list",
            name: "moduleType",
            message: "Select type to generate",
            choices: [
              { name: "single-spa application / parcel", value: "app-parcel" },
              {
                name: "in-browser utility module (styleguide, api cache, etc)",
                value: "util-module",
              },
              { name: "single-spa root config", value: "root-config" },
            ],
          },
        ])
      ).moduleType;
    }

    if (moduleType === "root-config") {
      this._setDestinationDir();

      this.composeWith(
        {
          Generator: SingleSpaRootConfigGenerator,
          path: require.resolve("./root-config/generator-root-config.js"),
        },
        this.options
      );
    } else if (moduleType === "app-parcel") {
      await runFrameworkGenerator.call(this);
    } else if (moduleType === "util-module") {
      this._setDestinationDir();

      if (!this.options.framework) {
        const answers = await this.prompt([
          {
            type: "list",
            name: "framework",
            message: "Which framework do you want to use?",
            choices: ["none", "react", "vue", "angular", "svelte", "other"],
          },
        ]);
        this.options.framework = answers.framework;
      }

      switch (this.options.framework) {
        case "none":
          this.composeWith(
            {
              Generator: SingleSpaUtilModuleGenerator,
              path: require.resolve(
                "./util-module/generator-single-spa-util-module.js"
              ),
            },
            this.options
          );
          break;
        case "react":
          this.composeWith(
            {
              Generator: ReactUtilModuleGenerator,
              path: require.resolve(
                "./util-module/generator-react-util-module.js"
              ),
            },
            this.options
          );
          break;
        default:
          throw Error(
            `Framework '${this.options.framework}' is not yet supported for utility microfrontends. Try creating a vanilla utility module (no framework) in the meantime, which are usable by all frameworks.`
          );
      }
    } else {
      throw Error(
        `unknown moduleType option ${moduleType}. Valid values are root-config, app-parcel, util-module`
      );
    }
  }
  _setDestinationDir() {
    if (this.options.dir) {
      const root = path.isAbsolute(this.options.dir)
        ? this.options.dir
        : path.resolve(process.cwd(), this.options.dir);
      this.destinationRoot(root);
    }
  }
};

async function runFrameworkGenerator() {
  if (!this.options.framework) {
    const answers = await this.prompt([
      {
        type: "list",
        name: "framework",
        message: "Which framework do you want to use?",
        choices: ["react", "vue", "angular", "svelte", "other"],
      },
    ]);

    this.options.framework = answers.framework;
  }

  switch (this.options.framework) {
    case "svelte":
      this._setDestinationDir();

      this.composeWith(
        {
          Generator: SingleSpaSvelteGenerator,
          path: require.resolve("./svelte/generator-single-spa-svelte.js"),
        },
        this.options
      );

      break;
    case "react":
      this._setDestinationDir();

      this.composeWith(
        {
          Generator: SingleSpaReactGenerator,
          path: require.resolve("./react/generator-single-spa-react.js"),
        },
        this.options
      );
      break;
    case "vue":
      this.composeWith(
        {
          Generator: SingleSpaVueGenerator,
          path: require.resolve("./vue/generator-single-spa-vue.js"),
        },
        this.options
      );
      break;
    case "angular":
      this.composeWith(
        {
          Generator: SingleSpaAngularGenerator,
          path: require.resolve("./angular/generator-single-spa-angular.js"),
        },
        this.options
      );
      break;
    case "other":
      console.log(
        `Check https://github.com/single-spa/create-single-spa/issues for updates on new frameworks being added to create-single-spa. Feel free to create a new issue if one does not yet exist for the framework you're using.`
      );
      break;
    default:
      throw Error(`Unsupported framework '${this.options.framework}'`);
  }
}
