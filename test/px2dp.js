import { Dimensions } from "react-native";
const uiWidthPx = 750;
export function px2dp(uiElementPx) {
  return (uiElementPx * Dimensions.get("window").width) / uiWidthPx;
}
