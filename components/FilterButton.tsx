import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const FilterButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.filterButton}>
      <FontAwesome5
        name="filter"
        size={18}
        color="white"
        style={{ marginRight: 5 }}
      />
      <Text style={styles.filterText}>Φίλτρα</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#E63946",
    borderRadius: 20,
    width: "25%",
    justifyContent: "center",
    alignSelf: "flex-end",
    position: "absolute",
    bottom: "4%",
    padding: 10,
    right: "4%",
  },
  filterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FilterButton;
