import React, { useState, useEffect } from "react";
import { Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { CustomText } from "./CustomText";
import { View } from "./Themed";

interface NotificationProps {
  message: string;
  hideAfterDuration?: boolean;
}

export const CustomBoxMessage: React.FC<NotificationProps> = ({
  message,
  hideAfterDuration,
}) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (hideAfterDuration) {
      const timeout = setTimeout(() => {
        hideNotification();
      }, 3000); // Fixed duration of 3000 milliseconds
      return () => clearTimeout(timeout);
    }
  }, []);

  const hideNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };
  if (!visible) {
    return null;
  }
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.innerContainer}>
        <CustomText style={styles.message}>{message}</CustomText>
        <TouchableOpacity activeOpacity={0.8} onPress={hideNotification}>
          <FontAwesome
            name="close"
            size={20}
            color="#fff"
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
  },
  innerContainer: {
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    color: "#fff",
    fontSize: 16,
  },
  closeIcon: {
    margin: 10,
  },
});
