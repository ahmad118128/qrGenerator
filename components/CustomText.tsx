import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
  size?: number;
}

export const CustomText: React.FC<CustomTextProps> = ({
  children,
  size,
  ...rest
}) => {
  return (
    <Text
      style={[styles.text, { fontFamily: "iranSans", fontSize: size }]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: "#000", // Default text color
  },
});
