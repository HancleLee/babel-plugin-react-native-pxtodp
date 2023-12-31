import { StyleSheet, View } from 'react-native'
import { b } from 'ff'

function test() {
  console.log('test', b)
}

const pxToDp = (px) => {
  return px * 2
}

const page = () => {
  return (
    <View style={{
      width: pxToDp(400),
      height: 20,
      backgroundColor: 'red',
    }}
    ></View>
  )
}

const myWidth = 300
const myHeight = 20
const fontSize = 10 + 10;
const percent = 80

const page1 = () => {
  return (
    <View
      style={{
        width: myWidth || 100,
        height: myHeight,
        backgroundColor: 'red',
        fontSize: `${fontSize}`,
        minHeight: `${10 + 10}`,
        minWidth: `${percent}%`,
      }}
    />
  )
}


const page2 = () => {
  return (
    <View
      style={[s.width, {
        width: 400,
        height: 20,
        fontSize: `${fontSize}`,
        backgroundColor: 'red',
        borderRadius: pxToDp(11)
      }, s.main]}
    />
  )
}


const s = StyleSheet.create({
  main: {
    height: 23,
    width: 10,
    a: 88,
  },
  width: {
    width: 1,
    y: 2
  }
})

const tp = {
  main: {
    width: 1,
    y: 2
  }
}

export const Test = () => {
  const fontSize = 10 + 10;
  return <View style={[styles.container, { fontSize: `${fontSize}`, size: `${10 + 10}` }]} />;
};


const styles = StyleSheet.create({
  container: {
    fontSize: "10rpx",
    // ignore_px_to_dp
    width: 200,
    height: 400,
    // ignore_px_to_dp
    borderRadius: 2,
    // this is bg color
    backgroundColor: "pink",
    // ignore pxToDp
    minHeight: `${10 + 10}`,
    minWidth: pxToDp(293)
  }
});
