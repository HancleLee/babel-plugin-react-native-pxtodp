// diable-react-native-px-to-dp-file
import { View } from 'react-native'

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
