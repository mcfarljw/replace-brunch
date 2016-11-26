'use strict';

const escape = require('escape-string-regexp');
const filesystem = require('fs');
const lodash = require('lodash');
const logger = require('loggy');

class ReplaceCompiler {

  constructor(config) {
    this.config = lodash.defaultsDeep(
      lodash.cloneDeep(config && config.plugins && config.plugins.replace || {}),
      {
        encoding: 'utf8',
        log: true,
        mappings: {
          date: (new Date()).toISOString(),
          timestamp:  Math.floor(Date.now() / 1000)
        },
        paths: [],
        replacePrefix: '{!',
        replaceSuffix: '!}'
      }
    );
  }

  getPaths(files, config) {
    return lodash
      .chain(files)
      .map(
        (file) => {
          return (file.destinationPath || file.destPath || file.path).replace(/\\/g, '/');
        }
      )
      .filter(
        (path) => {
          return !config.paths.length || config.paths.indexOf(path) > -1;
        }
      )
      .value();
  }

  replaceFile(path, config) {
    return new Promise(
      (resolve, reject) => {
        filesystem.readFile(
          path,
          config.encoding,
          (error, data) => {

            if (error) {
              return reject(error);
            }

            lodash.forIn(
              config.mappings,
              (value, key) => {
                const searchString = escape(config.replacePrefix + key.toString() + config.replaceSuffix);
                const searchExpression = new RegExp(searchString, 'g');

                data = data.replace(searchExpression, value);
              }
            );

            filesystem.writeFile(
              path,
              data,
              config.encoding,
              (error) => {
                if (error) {
                  return reject(error);
                }

                return resolve(data);
              }
            );
          }
        );
      }
    );
  }

  onCompile(files, assets) {
    const started = Date.now();
    const paths = this.getPaths(files.concat(assets), config);

    return Promise
      .all(
        lodash.map(
          paths,
          (path) => {
            return this.replaceFile(path, this.config);
          }
        )
      )
      .then(
        () => {
          logger.info(
            'replaced mappings in ' +
            paths.length +
            ' files, replaced in ' +
            (Date.now() - started) +
            'ms'
          );
        }
      )
      .catch((error) => logger.error(error));
  }

}

ReplaceCompiler.prototype.brunchPlugin = true;

module.exports = ReplaceCompiler;
