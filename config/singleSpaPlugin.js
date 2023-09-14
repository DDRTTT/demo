'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = _default;

function _default(api, options = {}) {
  if (options.singleSpaModel) {
    const domElementGetterStr = function domElementGetter() {
      return document.getElementById('singleChidren');
    };
    api.addEntryImport({
      source: 'single-spa-react',
      specifier: 'singleSpaReact',
    });
    api.addEntryCodeAhead(`
    let reactLifecycles;
    reactLifecycles =  singleSpaReact({
        React,
        ReactDOM,
        rootComponent: (customProps) => window.g_plugins.apply('rootContainer', {
          initialValue: React.createElement(require('./router').default,customProps),
        }),
        domElementGetter: ${
          options.base ? `() => document.getElementById('root')` : domElementGetterStr
        }
    });
  `);
    api.modifyEntryRender(``);
    api.addEntryCode(`
    export const bootstrap = [
        () =>
          new Promise(resolve => {
            console.log('bootstrap..');
            resolve();
          }),
        reactLifecycles.bootstrap
    ];
    export const mount = [reactLifecycles.mount];
    export const unmount = [reactLifecycles.unmount];
  `);
    api.modifyWebpackConfig(config => {
      config.output.libraryTarget = 'umd';
      config.output.library = options.name || 'umi';
      config.output.publicPath = '/contract/';
      return config;
    });
  }
}
