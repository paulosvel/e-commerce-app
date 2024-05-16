import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

type ProductDetailsParams = {
  categoryUuid: number;
  subCategoryUuid: number;
  selectedCategoryName: string;
};

export default function CategorySelection() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );
  const navigation = useNavigation<NavigationProp<any>>();
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const [openSubCategoryDropdown, setOpenSubCategoryDropdown] = useState(false);

  const handleSearch = () => {
    if (selectedCategory && selectedSubCategory) {
      const params: ProductDetailsParams = {
        categoryUuid: selectedCategory,
        subCategoryUuid: selectedSubCategory,
        selectedCategoryName: selectedCategoryName,
      };
      navigation.navigate("ProductDetailsComponent", params);
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

      const formattedCategories = categories.map((category: any) => ({
        label: category.name,
        value: category.uuid,
        subCategories: category.sub_categories.map((subCat: any) => ({
          label: subCat.name,
          value: subCat.uuid,
        })),
      }));

      setCategories(formattedCategories);

      if (formattedCategories.length > 0) {
        const initialCategory = formattedCategories[0];
        setSelectedCategory(initialCategory.value);
        setSelectedCategoryName(initialCategory.label);
        if (initialCategory.subCategories.length > 0) {
          const initialSubCategory = initialCategory.subCategories[0];
          setSubCategories(initialCategory.subCategories);
          setSelectedSubCategory(initialSubCategory.value);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="shopping-cart" size={34} color="white" />
        <Text style={{ fontSize: 22, color: "white", fontWeight: "500" }}>
          e-Καταναλωτής
        </Text>
      </View>
      <Text style={styles.description}>
        Βρείτε την χαμηλότερη τιμή και εξοικονομήστε χρήματα! Συγκρίνετε τιμές
        σε εκατοντάδες προϊόντα, δημιουργήστε το δικό σας καλάθι και βρείτε σε
        ποια αλυσίδα supermarket είναι το φθηνότερο!
      </Text>
      <View style={{ zIndex: 1000 }}>
        <Text style={styles.categoriesText}>Ανά Κατηγορία</Text>
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
            setSelectedCategory(value as number);
            const selectedCat = categories.find((cat) => cat.value === value);
            if (selectedCat && selectedCat.subCategories) {
              setSubCategories(selectedCat.subCategories);
              if (selectedCat.subCategories.length > 0) {
                setSelectedSubCategory(selectedCat.subCategories[0].value);
              } else {
                setSelectedSubCategory(null);
              }
            }
          }}
        />
      </View>
      {selectedCategory && subCategories.length > 0 && (
        <View style={{ zIndex: 500 }}>
          <Text style={styles.categoriesText}>Ανά Υποκατηγορία</Text>
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
              setSelectedSubCategory(value as number);
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
    marginBottom: 10,
    gap: 10,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  categoriesText: {
    color: "white",
    margin: 5,
    fontSize: 17,
    fontWeight: "600",
  },
});
