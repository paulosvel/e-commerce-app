import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Picker from "react-native-picker-select";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function CategorySelection() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const navigation = useNavigation();
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState(null);
  const [selectedSubCategoryUuid, setSelectedSubCategoryUuid] = useState(null);

  const handleSearch = () => {
    console.log("Selected category UUID:", selectedCategoryUuid);
    console.log("Selected sub-category UUID:", selectedSubCategoryUuid);
    if (selectedCategoryUuid && selectedSubCategoryUuid) {
      navigation.navigate("ProductDetailsComponent", {
        categoryUuid: selectedCategoryUuid,
        subCategoryUuid: selectedSubCategoryUuid,
      });
    } else {
      console.error("You must select both a category and a sub-category.");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/basket-retailers/prices.json"
      );
      const categories = response.data.context.MAPP_PRODUCTS.result.categories;

      setCategories(categories);
      if (categories.length > 0) {
        setSelectedCategory(categories[0].name);
        if (
          categories[0].sub_categories &&
          categories[0].sub_categories.length > 0
        ) {
          setSelectedSubCategory(categories[0].sub_categories[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>e-Καταναλωτής</Text>
      <Text style={styles.description}>
        Βρείτε την χαμηλότερη τιμή και εξοικονομήστε χρήματα! Συγκρίνετε τιμές
        σε εκατοντάδες προϊόντα, δημιουργήστε το δικό σας καλάθι και βρείτε σε
        ποια αλυσίδα supermarket είναι το φθηνότερο!
      </Text>
      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => {
          const category = categories.find((cat) => cat.name === itemValue);
          if (category) {
            setSelectedCategory(itemValue);
            setSelectedCategoryUuid(category.uuid);
            if (category.sub_categories.length > 0) {
              setSelectedSubCategory(category.sub_categories[0].name);
              setSelectedSubCategoryUuid(category.sub_categories[0].uuid);
            } else {
              setSelectedSubCategory(null);
              setSelectedSubCategoryUuid(null);
            }
          }
        }}
        items={categories.map((category) => ({
          label: category.name,
          value: category.name,
        }))}
      />
      {selectedCategory &&
        categories.find((cat) => cat.name === selectedCategory)?.sub_categories
          .length > 0 && (
          <Picker
            selectedValue={selectedSubCategory}
            style={styles.picker}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedSubCategory(itemValue)
            }
            items={categories
              .find((cat) => cat.name === selectedCategory)
              ?.sub_categories?.map((subCat) => ({
                label: subCat.name,
                value: subCat.name,
              }))}
          />
        )}
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
