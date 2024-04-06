import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from "react-native";

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  fullWidth?: boolean;
  buttonStyle?: ViewStyle;
  type?: "blue" | "gray" | "green" | "red"; // Define the type prop
}

const buttonColor = {
  blue: "#007bff",
  gray: "#6c757d",
  red: "#dc3545",
  green: "#28a745",
};

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  buttonStyle,
  fullWidth,
  type = "blue",
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonColor[type] },
        fullWidth && { width: "100%" },
        buttonStyle,
      ]}
      {...rest}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
