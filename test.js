'use strict';

const async = require('async');
const expect = require('chai').expect;
const filesystem = require('fs');

describe('ReplacePlugin', function() {
  const Plugin = require('./index.js');

  afterEach(
    (done) => {
      async.parallel(
        [
          async.apply(filesystem.writeFile, 'test_files/date.txt', '{!date!}', 'utf8'),
          async.apply(filesystem.writeFile, 'test_files/manifest.json', '{"version": "{?version?}"}', 'utf8'),
          async.apply(filesystem.writeFile, 'test_files/timestamp.txt', '{!timestamp!}', 'utf8'),
          async.apply(filesystem.writeFile, 'test_files/version.txt', '{?version?}', 'utf8')
        ],
        done
      );
    }
  );

  it('should compile user specified paths',
    () => {
      const options = {
        plugins: {
          replace: {
            paths: ['test_files/version.txt']
          }
        }
      };

      const plugin = new Plugin(options);
      const pluginConfig = plugin.config;

      const paths = plugin.getPaths(
        [
          {path: 'test_files/date.txt'},
          {path: 'test_files/manifest.json'},
          {path: 'test_files/timestamp.txt'},
          {path: 'test_files/version.txt'}
        ],
        pluginConfig
      );

      expect(paths[0]).to.equal('test_files/version.txt');
    }
  );

  it('should set default configs and paths',
    () => {
      const plugin = new Plugin();
      const pluginConfig = plugin.config;

      const paths = plugin.getPaths(
        [
          {path: 'test_files/date.txt'},
          {path: 'test_files/manifest.json'},
          {path: 'test_files/timestamp.txt'},
          {path: 'test_files/version.txt'}
        ],
        pluginConfig
      );

      expect(pluginConfig.encoding).to.equal('utf8');
      expect(pluginConfig.mappings.date).to.be.a('string');
      expect(pluginConfig.mappings.timestamp).to.be.a('number');
      expect(pluginConfig.replacePrefix).to.equal('{!');
      expect(pluginConfig.replaceSuffix).to.equal('!}');
      expect(paths).to.have.length(4);
    }
  );

  it('should replace default string mappings',
    (done) => {
      const plugin = new Plugin();
      const pluginConfig = plugin.config;

      async.parallel(
        [
          (callback) => {
            plugin.replaceFile('test_files/date.txt', pluginConfig)
              .catch(callback)
              .then(
                (data) => {
                  expect(data.toString()).to.have.equal(pluginConfig.mappings.date);
                  callback();
                }
              );
          },
          (callback) => {
            plugin.replaceFile('test_files/timestamp.txt', pluginConfig)
              .catch(callback)
              .then(
                (data) => {
                  expect(parseInt(data, 10)).to.equal(pluginConfig.mappings.timestamp);
                  callback();
                }
              );
          }
        ],
        done
      );
    }
  );

  it('should replace user string mappings',
    (done) => {
      const options = {
        plugins: {
          replace: {
            mappings: {'version': '0.0.1'},
            replacePrefix: '{?',
            replaceSuffix: '?}'
          }
        }
      };

      const plugin = new Plugin(options);
      const pluginConfig = plugin.config;

      async.parallel(
        [
          (callback) => {
            plugin.replaceFile('test_files/manifest.json', pluginConfig)
              .catch(callback)
              .then(
                (data) => {
                  expect(data.toString()).to.equal('{"version": "0.0.1"}');
                  callback();
                }
              );
          },
          (callback) => {
            plugin.replaceFile('test_files/version.txt', pluginConfig)
              .catch(callback)
              .then(
                (data) => {
                  expect(data.toString()).to.equal('0.0.1');
                  callback();
                }
              );
          }
        ],
        done
      );

    }
  );

});
