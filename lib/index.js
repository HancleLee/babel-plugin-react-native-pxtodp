const { declare } = require("@babel/helper-plugin-utils");
const path = require("path");
const { keyNameList } = require("./const");
var localDimensions = "Dimensions";

const defaultOptions = {
    uiWidth: 750,/**                        */ // 设计稿宽度
    includes: [], /**                       */ // 需要处理的文件
    excludes: ["node_modules"], /**         */ // 不进行处理的文件，优先级高于includes
    superIncludes: [], /**                  */ // 需要处理的文件，优先级高于excludes
    extraKeyNames: keyNameList,
};

const plugin = declare((api, opts) => {
    // 断言: babel版本是否为7
    api.assertVersion(7);

    console.log('******** 「px to dp」 babel plugin working *******')

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
            : defaultOptions.excludes,
        extraKeyNames: opts.extraKeyNames ? Array.from(new Set([...defaultOptions.extraKeyNames, ...opts.extraKeyNames]))
            : defaultOptions.extraKeyNames,
    };

    return {
        visitor: {
            Program(path, state) {
                let isValid = false;
                isValid = checkFileIsValid(path, state, options);
                if (isValid) {
                    let importList = path.node.body || [];
                    // 去掉原Dimensions引用
                    importList.forEach(item => {
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
                let isValid = false;
                isValid = checkFileIsValid(path, state, options);
                if (isValid) {
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
                                convertPxToDp(types, options, propProp)
                            }
                        }
                    }
                }
            },
            JSXOpeningElement(path, state) {
                let isValid = false;
                isValid = checkFileIsValid(path, state, options);
                if (isValid) {
                    const attributes = path.node.attributes;
                    for (const attr of attributes) {
                        if (attr.name && attr.name.name === 'style' && types.isJSXExpressionContainer(attr.value)) {
                            const styleExpression = attr.value.expression;
                            if (types.isArrayExpression(styleExpression)) {
                                for (const element of styleExpression.elements) {
                                    if (types.isObjectExpression(element)) {
                                        for (const prop of element.properties) {
                                            convertPxToDp(types, options, prop)
                                        }
                                    }
                                }
                            } else if (types.isObjectExpression(styleExpression)) {
                                for (const prop of styleExpression.properties) {
                                    convertPxToDp(types, options, prop)
                                }
                            }
                        }
                    }
                }
            },
        }
    };
});


/**
 * 校验是否为可进行单位转化的有效文件
 * @returns boolean 是否有效
 */
function checkFileIsValid(path, state, options) {
    const res = !checkFileIsImmunity(state.file.ast.comments, path.node) && isInclude(state, options);
    return res
}

function isInclude(state, options) {
    let filename = state.filename
    // 处理Mac和windows路径是斜杠和反斜杠问题，统一为 斜杠
    filename = filename.split(path.sep).join("/");
    let flag = false;
    options.includes.forEach(inc => {
        if (filename?.indexOf(inc) !== -1) {
            flag = true;
        }
    });
    options.excludes.forEach(exc => {
        if (filename?.indexOf(exc) !== -1) {
            flag = false;
        }
    });
    options.superIncludes.forEach(inc => {
        if (filename?.indexOf(inc) !== -1) {
            flag = true;
        }
    });
    return flag;
}

/**
 * 是否豁免该文件
 * @param {注释} allComments 数组
 * @param {节点} node 
 * @returns boolean
 */
function checkFileIsImmunity(allComments, node) {
    const comments = (allComments || []).filter(comment => {
        if (comment && comment.value.replace(/^\*/, '').trim() === 'diable-react-native-px-to-dp-file') {
            return true;
        }
        // 不豁免
        return false;
    })
    return comments.length > 0
}


/**
 * 将px转化成dp
 */
function convertPxToDp(types, options, node) {
    if (types.isObjectProperty(node)) {
        if (options.extraKeyNames.includes(node.key.name)) {
            const { value: nodeVal, leadingComments, trailingComments } = node;
            if ((leadingComments && leadingComments.some(c => c.value.replace(/^\*/, '').trim() === 'ignore_px_to_dp'))
                || (trailingComments && trailingComments.some(c => c.value.replace(/^\*/, '').trim() === 'ignore_px_to_dp'))) {
                return
            }
            if (types.isNumericLiteral(nodeVal)) {
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
                        types.numericLiteral(nodeVal.value)
                    ),
                    types.numericLiteral(options.uiWidth)
                );
                node.value = dynamicExpression;

            } else if (types.isIdentifier(nodeVal)
                || types.isLogicalExpression(nodeVal)
                || types.isTemplateLiteral(nodeVal)
                || (types.isCallExpression(nodeVal) && nodeVal.callee && nodeVal.callee.name !== 'pxToDp')) {
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
                        types.parenthesizedExpression(nodeVal)
                    ),
                    types.numericLiteral(options.uiWidth)
                );
                node.value = dynamicExpression;
            }
        }
    }
}

module.exports = plugin;
