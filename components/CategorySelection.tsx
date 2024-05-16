import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function CategorySelection() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const navigation = useNavigation();
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState(null);
  const [selectedSubCategoryUuid, setSelectedSubCategoryUuid] = useState(null);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [openSubCategoryDropdown, setOpenSubCategoryDropdown] = useState(false);

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

      const formattedCategories = categories.map((category) => ({
        label: category.name,
        value: category.uuid,
        subCategories: category.sub_categories,
      }));

      setCategories(formattedCategories);

      if (formattedCategories.length > 0) {
        const initialCategory = formattedCategories[0];
        setSelectedCategory(initialCategory.value);
        setSelectedCategoryUuid(initialCategory.value);

        if (initialCategory.subCategories.length > 0) {
          const initialSubCategory = initialCategory.subCategories[0];
          setSubCategories(
            initialCategory.subCategories.map((subCat) => ({
              label: subCat.name,
              value: subCat.uuid,
            }))
          );
          setSelectedSubCategory(initialSubCategory.value);
          setSelectedSubCategoryUuid(initialSubCategory.value);
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
      <View style={{ zIndex: 1000 }}>
        <DropDownPicker
          open={openCategoryDropdown}
          value={selectedCategory}
          items={categories}
          setOpen={setOpenCategoryDropdown}
          setValue={setSelectedCategory}
          setItems={setCategories}
          containerStyle={styles.picker}
          style={{ backgroundColor: "#ffffff" }}
          dropDownContainerStyle={{ backgroundColor: "#ffffff" }}
          onChangeValue={(value) => {
            setSelectedCategoryUuid(value);
            const selectedCat = categories.find((cat) => cat.value === value);
            if (selectedCat && selectedCat.subCategories) {
              const formattedSubCategories = selectedCat.subCategories.map(
                (subCat) => ({
                  label: subCat.name,
                  value: subCat.uuid,
                })
              );
              setSubCategories(formattedSubCategories);
              if (formattedSubCategories.length > 0) {
                setSelectedSubCategory(formattedSubCategories[0].value);
                setSelectedSubCategoryUuid(formattedSubCategories[0].value);
              } else {
                setSelectedSubCategory(null);
                setSelectedSubCategoryUuid(null);
              }
            }
          }}
        />
      </View>
      {selectedCategory && subCategories.length > 0 && (
        <View style={{ zIndex: 500 }}>
          <DropDownPicker
            open={openSubCategoryDropdown}
            value={selectedSubCategory}
            items={subCategories}
            setOpen={setOpenSubCategoryDropdown}
            setValue={setSelectedSubCategory}
            setItems={setSubCategories}
            containerStyle={styles.picker}
            style={{ backgroundColor: "#ffffff" }}
            dropDownContainerStyle={{ backgroundColor: "#ffffff" }}
            onChangeValue={(value) => {
              setSelectedSubCategoryUuid(value);
            }}
          />
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Αναζήτηση</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Πηγή άντλησης των τιμών των προϊόντων από το κεντρικό eshop κάθε
        αλυσίδας. Οι τιμές ενημερώνονται καθημερινά στις 10:00.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F7543E",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "white",
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1A73E8",
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  footer: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
});
