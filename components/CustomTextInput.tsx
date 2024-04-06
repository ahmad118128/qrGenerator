import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface CustomTextInputProps extends TextInputProps {
  placeholder?: string;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder,
  style,
  ...rest
}) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      placeholderTextColor="#a9a9a9"
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
});
