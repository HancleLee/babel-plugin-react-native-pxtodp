const { declare } = require("@babel/helper-plugin-utils");
const path = require("path");
const { keyNameList } = require("./const");
var localDimensions = "Dimensions"; // 本地Dimensions的引用名称

const defaultOptions = {
    uiWidth: 750,
    includes: [],
    excludes: ["node_modules"],
    superIncludes: []
};

const plugin = declare((api, opts) => {
    // 断言babel为7,否则报错
    api.assertVersion(7);
    const { types, template } = api;
    let options = {
        ...opts,
        uiWidth: opts.uiWidth || defaultOptions.uiWidth,
        includes: opts.includes
            ? Array.from(new Set([...defaultOptions.includes, ...opts.includes]))
            : defaultOptions.includes,
        superIncludes: opts.superIncludes
            ? Array.from(new Set([...defaultOptions.superIncludes, ...opts.superIncludes]))
            : defaultOptions.superIncludes,
        excludes: opts.excludes
            ? Array.from(new Set([...defaultOptions.excludes, ...opts.excludes]))
            : defaultOptions.excludes
    };
    return {
        visitor: {
            Program(path, state) {
                let isPlugin = false;
                isPlugin = filterFileName(state.filename, options);
                if (isPlugin) {
                    let importList = path.node.body || [];
                    // 去掉原Dimensions引用
                    importList.forEach(item => {
                        // 找到import并且是reacat-native的节点
                        if (item.type === "ImportDeclaration" && item.source.value === "react-native") {
                            item.specifiers.forEach((y, i) => {
                                if (y.imported.name === localDimensions) {
                                    item.specifiers.splice(i, 1);
                                }
                            });
                        }
                    });
                    // 添加 import { Dimensions } from "react-native";
                    importList.unshift(
                        types.importDeclaration(
                            [types.importSpecifier(types.identifier(localDimensions), types.identifier(localDimensions))],
                            types.stringLiteral("react-native")
                        )
                    );
                }
            },
            // 只处理StyleSheet.create()创建出来的样式
            CallExpression(path, state) {
                let isPlugin = false;
                isPlugin = filterFileName(state.filename, options);
                if (isPlugin) {
                    const { callee, arguments: args } = path.node;
                    if (
                        types.isMemberExpression(callee) &&
                        types.isIdentifier(callee.object, { name: 'StyleSheet' }) &&
                        types.isIdentifier(callee.property, { name: 'create' }) &&
                        args.length === 1 &&
                        types.isObjectExpression(args[0])
                    ) {
                        const properties = args[0].properties;
                        for (const prop of properties) {
                            const propProperties = prop.value.properties
                            for (const propProp of propProperties) {
                                if (types.isObjectProperty(propProp)) {
                                    if (keyNameList.includes(propProp.key.name) && types.isNumericLiteral(propProp.value)) {
                                        const { value } = propProp;
                                        const dynamicExpression = types.binaryExpression(
                                            '/',
                                            types.binaryExpression(
                                                '*',
                                                types.memberExpression(
                                                    types.callExpression(
                                                        types.memberExpression(types.identifier(localDimensions), types.identifier('get')),
                                                        [types.stringLiteral('window')]
                                                    ),
                                                    types.identifier('width')
                                                ),
                                                types.numericLiteral(value.value)
                                            ),
                                            types.numericLiteral(options.uiWidth)
                                        );
                                        propProp.value = dynamicExpression;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // TemplateLiteral(path, state) {
            //     let isPlugin = false;
            //     isPlugin = filterFileName(state.filename, options);
            //     if (isPlugin) {
            //         // `${fontSize}rpx`可以被检测到
            //         // /^\${[0-9a-zA-Z_]+}rpx$/.test(`${fontSize}rpx`)
            //         // 模板字符串
            //         var templateStr = path.toString();
            //         if (/^`\${[\s\S]*}rpx`$/.test(templateStr)) {
            //             var startIndex = templateStr.indexOf("{");
            //             var endIndex = templateStr.lastIndexOf("}");
            //             // 截取模板中的变量
            //             var result = templateStr.slice(startIndex + 1, endIndex);
            //             let ast = template.expression(
            //                 `${localDimensions}.get('window').width * ( ${result} ) / ${options.uiWidth}`
            //             )();
            //             path.replaceWith(ast);
            //             // 如果不调用跳过会导致死循环replaceWith的节点
            //             path.skip();
            //         }
            //     }
            // }
        }
    };
});

// 根据路径判断哪些插件的作用区域，excludes的优先级高于 includes
function filterFileName(filename, options) {
    // 处理Mac和windows路径是斜杠和反斜杠问题，统一为 斜杠
    filename = filename.split(path.sep).join("/");
    let flag = false;
    // 包含
    options.includes.forEach(inc => {
        // 路径里面进行筛选
        if (filename?.indexOf(inc) !== -1) {
            flag = true;
        }
    });
    // 排除
    options.excludes.forEach(exc => {
        if (filename?.indexOf(exc) !== -1) {
            flag = false;
        }
    });
    // 包含(一般不用)
    options.superIncludes.forEach(inc => {
        if (filename?.indexOf(inc) !== -1) {
            flag = true;
        }
    });
    return flag;
}

module.exports = plugin;
