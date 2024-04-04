import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
}

export const CustomText: React.FC<CustomTextProps> = ({
  children,
  ...rest
}) => {
  return (
    <Text style={styles.text} {...rest}>
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
