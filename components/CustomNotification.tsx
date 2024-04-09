import React, { useState, useEffect } from "react";
import { Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { CustomText } from "./CustomText";

interface NotificationProps {
  message: string;
  hideAfterDuration?: boolean;
}

export const CustomNotification: React.FC<NotificationProps> = ({
  message,
  hideAfterDuration,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
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
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.innerContainer}
        activeOpacity={0.8}
        onPress={hideNotification}
      >
        <CustomText style={styles.message}>{message}</CustomText>
        {hideAfterDuration && (
          <FontAwesome
            name="times"
            size={20}
            color="#fff"
            style={styles.closeIcon}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    color: "#fff",
    fontSize: 16,
  },
  closeIcon: {
    marginLeft: 10,
  },
});
