import { StyleSheet, View } from 'react-native'

const myWidth = 300
const myHeight = 20

const page1 = () => {
    const fontSize = 10 + 10;
    return (
        <View
            style={{
                width: myWidth || 100,
                height: myHeight,
                backgroundColor: 'red',
                fontSize: `${fontSize}`,
                minHeight: `${10 + 10}`
            }}
        />
    )
}


const styles = StyleSheet.create({
    container: {
      fontSize: "10rpx",
      // sss
      width: 200,
      // not transform11
      backgroundColor: "pink",
      // ignore pxToDp
      minHeight: `${10 + 10}`, // ignnnn
      minWidht: 293
    }
  });
  