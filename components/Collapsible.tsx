import { FontAwesome } from "@expo/vector-icons";
import React, { PropsWithChildren, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native";

interface CollapsibleProps extends PropsWithChildren {
  title: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentContainerStyle?: ViewStyle;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  children,
  containerStyle,
  titleStyle,
  contentContainerStyle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {/* Arrow icon */}
        <TouchableOpacity onPress={toggleCollapse}>
          <FontAwesome
            name={isCollapsed ? "chevron-down" : "chevron-up"}
            size={25}
            color="#000"
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      </View>
      {!isCollapsed && (
        <View style={[styles.contentContainer, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 10,
  },
});
