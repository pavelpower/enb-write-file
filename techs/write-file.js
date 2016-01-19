/**
 * enb write-file (and provide)
 * =============
 *
 * Гененрирует файл для make-платформы, записывая его в файловую систему.
 * Может, например, использоваться для предоставления исходного *bemdecl*-файла.
 *
 * **Опции**
 *
 * * *String* **target** — Цель - имя генерируемого файла. Обязательная опция.
 * * *String | Buffer* **content** - контент генерируемого файла, если он есть файл будет сгенерирован
 * * *Object | String* **fileOptions** - аттрибуты генерируемого файла (goo.gl/ZZzrdr)
 *
 * **Пример**
 *
 * Генерируем bemdecl-файл по всем блокам из слоя переопределения `external-apps`.
 * Как пример `external-apps` - является сабмодулем git
 *
 * ```javascript
 *
 * var apps = FS.readdirSync('external-apps');
 *
 * apps = apps.filter(function (name) {
 *        return name !== 'readme.md';
 *    }).map(function (name) {
 *        return '{name: "' + name + '"}'
 *    }).join(',\n');
 *
 * nodeConfig.addTech([ require('enb-write-file'), {
 *      content: ['exports.blocks = [\n', '{name: "b-log"}, {name: "b-flag"}', '\n];'].join('\n'),
 *      fileOptions: {
 *         encoding: 'utf8', // default
 *         mode: '0o666', // default
 *         flag: 'w' //default
 *      },
 *      target: '?.bemdecl.js'
 * } ]);
 * ```
 */
var fs = require('fs');
var Vow = require('vow');
var inherit = require('inherit');

module.exports = inherit(require('enb/lib/tech/base-tech'), {
    getName: function () {
        return 'write-file';
    },

    configure: function () {
        this._target = this.getRequiredOption('target');
        this._content = this.getOption('content');
        this._options = this.getOption('fileOptions');
    },

    getTargets: function () {
        return [this.node.unmaskTargetName(this._target)];
    },

    build: function () {
        var target, targetPath;

        target = this.node.unmaskTargetName(this._target);
        targetPath = this.node.resolvePath(target);

        if (this._content === undefined) {
            this.node.rejectTarget(target, new Error('the contents of the file "' + targetPath + '" is empty'));
            return new Vow.Promise();
        }

        fs.writeFile(targetPath, this._content, this._options || {}, function (error) {
            if (error) {
                this.node.rejectTarget(target, error);
                return;
            }

            this.node.resolveTarget(target);
        }.bind(this));

        return new Vow.Promise();
    },

    clean: function () {}
});
