var async = require('async');
var expect = require('chai').expect;
var filesystem = require('fs');

describe('Plugin', function() {
    var Plugin = require('./');

    afterEach(function(done) {
        async.parallel([
            async.apply(filesystem.writeFile, 'test_files/date.txt', '{!date!}', 'utf8'),
            async.apply(filesystem.writeFile, 'test_files/manifest.json', '{"version": "{?version?}"}', 'utf8'),
            async.apply(filesystem.writeFile, 'test_files/timestamp.txt', '{!timestamp!}', 'utf8'),
            async.apply(filesystem.writeFile, 'test_files/version.txt', '{?version?}', 'utf8')
        ], done);
    });

    it('should compile user specified paths', function() {
        var plugin = new Plugin({
            plugins: {
                replace: {
                    paths: ['test_files/version.txt']
                }
            }
        });
        var paths = plugin.getPaths([
            {path: 'test_files/date.txt'},
            {path: 'test_files/timestamp.txt'},
            {path: 'test_files/version.txt'}
        ], plugin.getConfig());
        expect(paths[0]).to.equal('test_files/version.txt');
    });

    it('should set default configs and paths', function() {
        var plugin = new Plugin();
        var config = plugin.getConfig();
        var paths = plugin.getPaths([
            {path: 'test_files/date.txt'},
            {path: 'test_files/timestamp.txt'},
            {path: 'test_files/version.txt'}
        ], config);
        expect(config.encoding).to.equal('utf8');
        expect(config.mappings.date).to.be.a('string');
        expect(config.mappings.timestamp).to.be.a('number');
        expect(config.replacePrefix).to.equal('{!');
        expect(config.replaceSuffix).to.equal('!}');
        expect(paths).to.have.length(3);
    });

    it('should replace default string mappings', function(done) {
        var plugin = new Plugin();
        var config = plugin.getConfig();
        async.parallel([
            function(callback) {
                plugin.replaceFile('test_files/date.txt', config, function(error, path, data) {
                    if (error) {
                        callback(error);
                    } else {
                        var date = data.toString();
                        expect(date).to.have.equal(config.mappings.date);
                        callback();
                    }
                });
            },
            function(callback) {
                plugin.replaceFile('test_files/timestamp.txt', config, function(error, path, data) {
                    if (error) {
                        callback(error);
                    } else {
                        var date = parseInt(data, 10);
                        expect(date).to.equal(config.mappings.timestamp);
                        callback();
                    }
                });
            }
        ], done);
    });

    it('should replace user string mappings', function(done) {
        var plugin = new Plugin({
            plugins: {
                replace: {
                    mappings: {'version': '0.0.1'},
                    replacePrefix: '{?',
                    replaceSuffix: '?}'
                }
            }
        });
        var config = plugin.getConfig();
        async.parallel([
            function(callback) {
                plugin.replaceFile('test_files/manifest.json', config, function(error, path, data) {
                    if (error) {
                        callback(error);
                    } else {
                        var version = data.toString();
                        expect(version).to.equal('{"version": "0.0.1"}');
                        callback();
                    }
                });
            },
            function(callback) {
                plugin.replaceFile('test_files/version.txt', config, function(error, path, data) {
                    if (error) {
                        callback(error);
                    } else {
                        var version = data.toString();
                        expect(version).to.equal('0.0.1');
                        callback();
                    }
                });
            }
        ], done);

    });

});
