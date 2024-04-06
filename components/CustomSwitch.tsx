import React from "react";
import { Switch, StyleSheet, SwitchProps } from "react-native";
import { View } from "./Themed";
import { CustomText } from "./CustomText";

interface CustomSwitchProps extends SwitchProps {
  label?: string;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  ...rest
}) => {
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
      }}
    >
      <Switch style={styles.switch} {...rest} />
      {label && <CustomText>{label}</CustomText>}
    </View>
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], // Adjust the scale based on your preference
  },
});
