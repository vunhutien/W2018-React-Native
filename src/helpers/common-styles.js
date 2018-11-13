import { StyleSheet } from "react-native";
import {
  sizeWidth
} from "../helpers/size.helper";

export const COLORS = {
  GRAYISH_BLUE: "#3C5063",
  GREEN_PET_ICT: "#00A19C",
  SOFT_PURPLE: "#58478D",
  PALE_NAVY: "#C4C9DF"
};

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: sizeWidth(100),
    paddingRight: 20,
    paddingTop: 30,
    marginBottom: 20
  },
  title: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 23,
    marginBottom: -5,
    paddingLeft: 30
  },
  horizontalDivider: {
    backgroundColor: COLORS.PALE_NAVY,
    height: 1
  }
});