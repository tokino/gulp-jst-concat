"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const through2_1 = __importDefault(require("through2"));
const lodash_1 = __importDefault(require("lodash"));
const vinyl_1 = __importDefault(require("vinyl"));
const gulp_util_1 = require("gulp-util");
const PLUGIN_NAME = 'gulp-jst-concat';
function compile(file, renameKeys) {
    const name = file.path.replace(new RegExp(renameKeys[0]), renameKeys[1]), contents = String(file.contents);
    return {
        name: name,
        fnSource: lodash_1.default.template(contents).source
    };
}
function buildJSTString(file, renameKeys) {
    const template = compile(file, renameKeys);
    return `"${template.name}": ${template.fnSource}`;
}
module.exports = function jstConcat(fileName, _opts) {
    if (!fileName) {
        throw new gulp_util_1.PluginError(PLUGIN_NAME, 'Missing fileName');
    }
    const defaults = { renameKeys: ['.*', '$&'] }, opts = lodash_1.default.extend({}, defaults, _opts), files = [];
    return through2_1.default.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            return this.emit('error', new gulp_util_1.PluginError(PLUGIN_NAME, 'Streams not supported!'));
        }
        const jstString = buildJSTString(file, opts.renameKeys);
        files.push(jstString);
        callback(null, file);
    }, function (callback) {
        this.push(new vinyl_1.default({
            path: fileName,
            contents: Buffer.from(`this.JST = {${files.join(',\n')}};`)
        }));
        callback();
    });
};
