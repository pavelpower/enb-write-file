# enb-write-file

Технология генерирование файла указав контент в виде типа String или Bufer.

Одновременно выполнить функцию provide (то, что делает file-provide) для платформы make.

## Зачем это нужно?

Как пример использования такой технологии приведу задачу из моего проекта.

Задача: к проекту посредством сабмодуля гит подключается слой переопределения с набором блоков.
Весь JavaScript код из этих блоков должен быть собран в один модуль `extention-apps`. 
И добавлен в модульную систему как один модуль.

Вот пример файла который нужно сгенерировать:

`common.blocks/external-apps/external-apps.js`

```javascript
modules.define('external-apps', function(provide, apps) {

    apps = apps || {};

    apps['app-tetris'] = {
        init: funciton () {
            //...
        }
    };

    provide(apps);
});

modules.define('external-apps', function(provide, apps) {

    apps = apps || {};

    apps['app-footboal'] = {
        init: funciton () {
            //...
        }
    };

    provide(apps);
});

// more apps ....

```

Как это можно реализовать?

А вот так:

```javascript
var techs = require('enb-bem-techs'),
    writeFile = rewuire('enb-write-file'),
    js = require('enb/techs/js');

module.exports = function (config) {

    var contentBemdeclFile,
        apps = FS.readdirSync('./external-apps'); // read git-submodules layer

    // create content for "external-apps.bemdecl.js"
    apps = apps.filter(function (name) {
        return name !== 'readme.md';
    }).map(function (name) {
        return '{name: "' + name + '"}'
    }).join(',\n');

    contentBemdeclFile = ['exports.blocks = [\n', apps, '\n];'].join('\n');

    config.node('common.blocks/external-apps', function (nodeConfig) {

        nodeConfig.addTechs([
            [techs.levels, {
                levels: [
                    {path: nodeConfig._path, check: true},
                    {path: config.resolvePath('external-apps'), check: true}
                ]
            }],

            [writeFile, {
                target: '?.bemdecl.js',
                content: contentBemdeclFile
            }],

            [techs.files, {depsFile: '?.bemdecl.js'}],

            // concat all js files to externl-apps.js
            [js, {
                target: '?.js'
            }]
        ]);

        nodeConfig.addTargets(['?.js']);
    });

}

```