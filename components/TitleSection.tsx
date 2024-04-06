import React from "react";
import { View, Text, ViewStyle, TextStyle, StyleSheet } from "react-native";

interface TitleSectionProps {
  titles: string[];
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

export const TitleSection: React.FC<TitleSectionProps> = ({
  titles,
  containerStyle,
  titleStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {titles.map((title, i) => (
        <Text key={`${title}-${i}`} style={[styles.title, titleStyle]}>
          {title}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    marginVertical: 10,
    // flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
