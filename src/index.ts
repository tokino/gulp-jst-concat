import through from "through2";
import _ from 'lodash';
import Vinyl from 'vinyl';
import {PluginError} from 'gulp-util';

const PLUGIN_NAME = 'gulp-jst-concat';

function compile(file, renameKeys) {
    const name = file.path.replace(new RegExp(renameKeys[0]), renameKeys[1]),
        contents = String(file.contents);

    return {
        name: name,
        fnSource: _.template(contents).source
    }
}

function buildJSTString(file, renameKeys) {
    const template = compile(file, renameKeys);
    return `"${template.name}": ${template.fnSource}`;
}

module.exports = function jstConcat(fileName: string, _opts: any) {
    if (!fileName) {
        throw new PluginError(PLUGIN_NAME, 'Missing fileName')
    }

    const defaults = {renameKeys: ['.*', '$&']},
        opts = _.extend({}, defaults, _opts),
        files: string[] = [];

    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
        }

        const jstString = buildJSTString(file, opts.renameKeys);
        files.push(jstString);
        callback(null, file);
    }, function (callback) {
        this.push(new Vinyl({
            path: fileName,
            contents: Buffer.from(`this.JST = {${files.join(',\n')}};`)
        }));
        callback();
    });

};