var async = require('async');
var escape = require('escape-string-regexp');
var filesystem = require('fs');
var logger = require('loggy');
var lodash = require('lodash');


/**
 * @class ReplaceCompiler
 * @param {Object} [config]
 * @constructor
 */
function ReplaceCompiler(config) {
    this.config = lodash.cloneDeep(config || {});
    this.config = lodash.defaultsDeep(
        this.config,
        {
            plugins: {
                replace: {}
            }
        }
    );
}

/**
 * @property brunchPlugin
 * @type {Boolean}
 */
ReplaceCompiler.prototype.brunchPlugin = true;

/**
 * @method getConfig
 * @returns {Object}
 */
ReplaceCompiler.prototype.getConfig = function() {
    return lodash.defaultsDeep(
        this.config.plugins.replace,
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
};

/**
 * @method getPaths
 * @param {Array} files
 * @param {Object} config
 * @returns {Array}
 */
ReplaceCompiler.prototype.getPaths = function(files, config) {
    return lodash
        .chain(files)
        .map(function(file) {
            return (file.destinationPath || file.path).replace(/\\/g, '/');
        })
        .filter(function(path) {
            return !config.paths.length || config.paths.indexOf(path) > -1;
        })
        .value();
};

/**
 * @method replaceFile
 * @param {String} path
 * @param {Object} config
 * @param {Function} [callback]
 */
ReplaceCompiler.prototype.replaceFile = function(path, config, callback) {
    filesystem.readFile(
        path,
        config.encoding,
        function(error, data) {
            if (error) {
                if (typeof callback === 'function') {
                    callback(error, path);
                }
            } else {
                for (var key in config.mappings) {
                    if (config.mappings.hasOwnProperty(key)) {
                        var searchString = escape(config.replacePrefix + key.toString() + config.replaceSuffix);
                        var searchExpression = new RegExp(searchString, 'g');
                        var replaceString = config.mappings[key.toString()];
                        data = data.replace(searchExpression, replaceString);
                    }
                }
                filesystem.writeFile(
                    path,
                    data,
                    config.encoding,
                    function(error) {
                        if (error) {
                            if (typeof callback === 'function') {
                                callback(error, path);
                            }
                        } else {
                            if (typeof callback === 'function') {
                                callback(null, path, data, config);
                            }
                        }
                    }
                );
            }
        }
    );
};

/**
 * @method onCompile
 * @param {Array} files
 * @param {Array} assets
 * @param {Function} [callback]
 */
ReplaceCompiler.prototype.onCompile = function(files, assets, callback) {
    var config = this.getConfig();
    var paths = this.getPaths(files.concat(assets), config);
    var started = Date.now();
    async.each(
        paths,
        lodash.bind(
            function(path, callback) {
                this.replaceFile(path, config, callback);
            },
            this
        ),
        function(error, path) {
            if (config.log) {
                if (error) {
                    logger.error(error)
                } else {
                    logger.info(
                        'replaced mappings in ' +
                        paths.length +
                        ' files, replaced in ' +
                        (Date.now() - started) +
                        'ms'
                    );
                }
            }
            if (typeof callback === 'function') {
                callback(error, path);
            }
        }
    );
};

module.exports = ReplaceCompiler;
