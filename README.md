### 主要特性

- React Native屏幕适配方案
- Babel自动转化

                
----
                    
#### 安装
```
npm install @hancle/babel-plugin-react-native-pxtodp -D
```

#### 配置
```javascript
module.exports = {
  plugins: [
		// ... 其他配置
		['@hancle/babel-plugin-react-native-pxtodp',
			{
				uiWidth: 750,
				includes: ['src/views/'],
				excludes: [],
				superIncludes: [],
				extraKeyNames: []
			},
		],
  ],
}
```

#### 设置特定代码不转化
> 在样式前面加上注释 `// ignore_px_to_dp` 则不转化

*如下：*
```javascript
const styles = StyleSheet.create({
	  container: {
			// ignore_px_to_dp
			width: 200,
			// ignore_px_to_dp
			height: 400,
	  }
});

```

                
----
                    
### 相关配置
在babel.config.js 中进行配置

| 参数名        |  类型   |          说明                 |  默认值  |
| -------------   | :-------:  | :-------------------------: | :------------:  |
| uiWidth      | Number   | 设计稿宽度           |   750     |
| includes     |  String[]    | 插件生效的文件夹  |   []         |
| excludes     |  String[]    | 插件不生效的文件夹，优先级高于includes  |   ['node_modules']         |
| superIncludes    |  String[]    | 插件生效的文件夹，优先级高于excludes  |   []         |
| extraKeyNames |  String[]    | 插件生效的文件夹  |   [...defaultExtraKeyNames]         |

```javascript
/* 默认的extraKeyNames值，检测到这些key会做自动转化 */
// defaultExtraKeyNames
["width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "borderRadius",
  "borderBottomWidth",
  "borderBottomStartRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "borderBottomEndRadius",
  "borderTopWidth",
  "borderTopStartRadius",
  "borderTopRightRadius",
  "borderTopLeftRadius",
  "borderTopEndRadius",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "marginHorizontal",
  "marginVertical",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingHorizontal",
  "paddingVertical",
  "top",
  "right",
  "bottom",
  "left",
  "fontSize",
  "lineHeight"]
```


                
----
                    
#### 使用示例　

```javascript
import { StyleSheet, View } from 'react-native'

const pxToDp = (px) => {
  return px * 2
}

const MyPage = () => {
  const myMargin = 20
  const myPadding = 30
  return (
    <View>
      <View style={{
        width: pxToDp(400),
        height: 20,
        backgroundColor: 'red',
        margin: myMargin || 100,
        padding: `${myPadding}`,
        minHeight: `${10 + 10}`
      }}
      ></View>
      <View
        style={[styles.width, {
          width: 400, 
          // ignore_px_to_dp
          height: 20,
          fontSize: `${fontSize}`,
          backgroundColor: 'green',
          borderRadius: pxToDp(12)
        }, styles.bgBox]}
      />
      <View style={[styles.container, { fontSize: `${fontSize}` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  width: {
    width: 100,
  },
  bgBox: {
    height: 10,
  },
  container: {
    fontSize: "10rpx",
    // ignore_px_to_dp
    width: 200,
    height: 400,
	// ignore_px_to_dp
    borderRadius: 2,
    // this is bg color
    backgroundColor: "pink",
    minHeight: `${10 + 10}`,
    minWidth: pxToDp(293)
  }
});
```
*babel转化后的代码*
```javascript
import { Dimensions } from "react-native";
import { StyleSheet, View } from 'react-native';
const pxToDp = px => {
  return px * 2;
};
const MyPage = () => {
  const myMargin = 20;
  const myPadding = 30;
  return <View>
      <View style={{
      width: pxToDp(400),
      height: Dimensions.get("window").width * 20 / 750,
      backgroundColor: 'red',
      margin: Dimensions.get("window").width * (myMargin || 100) / 750,
      padding: Dimensions.get("window").width * (`${myPadding}`) / 750,
      minHeight: Dimensions.get("window").width * (`${10 + 10}`) / 750
    }}></View>
      <View style={[styles.width, {
      width: Dimensions.get("window").width * 400 / 750,
      // ignore_px_to_dp
      height: 20,
      fontSize: Dimensions.get("window").width * (`${fontSize}`) / 750,
      backgroundColor: 'green',
      borderRadius: pxToDp(12)
    }, styles.bgBox]} />
      <View style={[styles.container, {
      fontSize: Dimensions.get("window").width * (`${fontSize}`) / 750
    }]} />
    </View>;
};
const styles = StyleSheet.create({
  width: {
    width: Dimensions.get("window").width * 100 / 750
  },
  bgBox: {
    height: Dimensions.get("window").width * 10 / 750
  },
  container: {
    fontSize: "10rpx",
    // ignore_px_to_dp
    width: 200,
    height: Dimensions.get("window").width * 400 / 750,
    // ignore_px_to_dp
    borderRadius: 2,
    // this is bg color
    backgroundColor: "pink",
    minHeight: Dimensions.get("window").width * (`${10 + 10}`) / 750,
    minWidth: pxToDp(293)
  }
});
```




