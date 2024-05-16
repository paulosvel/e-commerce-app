import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import FilterButton from "./FilterButton";

export default function ProductDetailsComponent({ route }) {
  const { categoryUuid, subCategoryUuid, selectedCategoryName } = route.params;

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [selectedSubSubCategories, setSelectedSubSubCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascending");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Αύξουσα", value: "ascending" },
    { label: "Φθίνουσα", value: "descending" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/basket-retailers/prices.json"
        );
        const data = response.data.context.MAPP_PRODUCTS.result;
        setMerchants(data.merchants);
        setAllProducts(data.products);

        const initialFilteredProducts = data.products.filter((product) => {
          return (
            product.category?.includes(parseInt(categoryUuid)) &&
            (!subCategoryUuid ||
              product.category.includes(parseInt(subCategoryUuid)))
          );
        });

        setProducts(initialFilteredProducts);

        const subCategoriesData = data.categories.find(
          (category) => category.uuid === parseInt(categoryUuid)
        )?.sub_categories;

        const relevantSubCategories = subCategoryUuid
          ? subCategoriesData?.filter(
              (subCat) => subCat.uuid === parseInt(subCategoryUuid)
            )
          : subCategoriesData;

        const extractedSubSubCategories = relevantSubCategories
          ? relevantSubCategories.flatMap((subCat) => subCat.sub_sub_categories)
          : [];

        setSubSubCategories(extractedSubSubCategories);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [categoryUuid, subCategoryUuid]);

  useEffect(() => {
    applyFilters();
  }, [selectedMerchant, selectedSubSubCategories, sortOrder]);

  const toggleMerchant = (merchantUuid) => {
    if (selectedMerchant.includes(merchantUuid)) {
      setSelectedMerchant(selectedMerchant.filter((id) => id !== merchantUuid));
    } else {
      setSelectedMerchant([...selectedMerchant, merchantUuid]);
    }
  };

  const toggleSubSubCategory = (subSubCategoryUuid) => {
    if (selectedSubSubCategories.includes(subSubCategoryUuid)) {
      setSelectedSubSubCategories(
        selectedSubSubCategories.filter((id) => id !== subSubCategoryUuid)
      );
    } else {
      setSelectedSubSubCategories([
        ...selectedSubSubCategories,
        subSubCategoryUuid,
      ]);
    }
  };

  const getMinimumPrice = (prices) => {
    if (!prices || prices.length === 0) return "N/A";

    const minPrice = Math.min(...prices.map((price) => price.price));
    return minPrice.toFixed(2);
  };

  const applyFilters = () => {
    let filteredProducts = allProducts.filter((product) => {
      const isInCategory =
        product.category?.includes(parseInt(categoryUuid)) &&
        (!subCategoryUuid ||
          product.category.includes(parseInt(subCategoryUuid)));

      const isInMerchant =
        selectedMerchant.length > 0
          ? product.prices.some((price) =>
              selectedMerchant.includes(price.merchant_uuid)
            )
          : true;

      const isInSubSubCategory =
        selectedSubSubCategories.length > 0
          ? product.category?.some((categoryId) =>
              selectedSubSubCategories.includes(categoryId)
            )
          : true;

      return isInCategory && isInMerchant && isInSubSubCategory;
    });

    if (sortOrder === "ascending") {
      filteredProducts = filteredProducts.sort(
        (a, b) =>
          parseFloat(getMinimumPrice(a.prices)) -
          parseFloat(getMinimumPrice(b.prices))
      );
    } else {
      filteredProducts = filteredProducts.sort(
        (a, b) =>
          parseFloat(getMinimumPrice(b.prices)) -
          parseFloat(getMinimumPrice(a.prices))
      );
    }

    setProducts(filteredProducts);
  };

  const getMerchantCount = (product) => {
    const merchantIDs = product.prices.map((price) => price.merchant_uuid);
    const uniqueMerchants = new Set(merchantIDs);
    return uniqueMerchants.size;
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.selectedCategoryName}>{selectedCategoryName}</Text>
        <Text style={styles.productCountText}>{products.length} Προϊόντα</Text>
      </View>
      <ScrollView style={styles.container}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Image
                source={{
                  uri: `https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/${product.image}`,
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.merchantName}>
                  Σε {getMerchantCount(product)} αλυσίδες
                </Text>
                <Text style={styles.productPrice}>
                  <Text style={{ color: "#888" }}>από </Text>
                  {getMinimumPrice(product.prices)}€
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity style={styles.cartButton}>
                <Feather
                  name="shopping-cart"
                  size={30}
                  color="white"
                  style={{ textAlign: "center" }}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {products.length === 0 && (
          <Text style={styles.noProductsText}>
            No products found for the selected category and sub-category.
          </Text>
        )}
      </ScrollView>
      <FilterButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Φίλτρα</Text>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Ταξινόμηση κατά</Text>
            <View style={styles.pickerContainer}>
              <DropDownPicker
                open={open}
                value={sortOrder}
                items={items}
                setOpen={setOpen}
                setValue={setSortOrder}
                setItems={setItems}
                style={styles.picker}
                dropDownContainerStyle={styles.dropDownPicker}
                zIndex={1000}
              />
            </View>
            <Text style={styles.modalSectionTitle}>Υποκατηγορίες</Text>
            {subSubCategories.map((subSubCategory) => (
              <TouchableOpacity
                key={subSubCategory.uuid}
                onPress={() => toggleSubSubCategory(subSubCategory.uuid)}
                style={styles.filterItem}
              >
                <Text style={styles.filterItemText}>{subSubCategory.name}</Text>
                {selectedSubSubCategories.includes(subSubCategory.uuid) ? (
                  <AntDesign name="checkcircle" size={24} color="#007AFF" />
                ) : (
                  <View style={styles.circle}>
                    <AntDesign
                      name="checkcircle"
                      size={24}
                      color="transparent"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <Text style={styles.modalSectionTitle}>Επωνυμίες/Μάρκες</Text>
            {merchants.map((merchant) => (
              <TouchableOpacity
                key={merchant.merchant_uuid}
                onPress={() => toggleMerchant(merchant.merchant_uuid)}
                style={styles.filterItem}
              >
                <Text style={styles.filterItemText}>
                  {merchant.display_name}
                </Text>
                {selectedMerchant.includes(merchant.merchant_uuid) ? (
                  <AntDesign name="checkcircle" size={24} color="#007AFF" />
                ) : (
                  <View style={styles.circle}>
                    <AntDesign
                      name="checkcircle"
                      size={24}
                      color="transparent"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedMerchant([]);
                setSelectedSubSubCategories([]);
              }}
            >
              <Text style={styles.clearButtonText}>Καθαρισμός</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resultsButton}
              onPress={() => {
                setModalVisible(false);
                applyFilters();
              }}
            >
              <Text style={styles.resultsButtonText}>Αποτελέσματα</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white",
  },
  selectedCategoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  productCountText: {
    fontSize: 14,
    color: "#E63946",
    marginLeft: 5,
  },
  productCard: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 5,
  },
  productInfo: {
    flex: 1,
    marginLeft: "5%",
    gap: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E63946",
  },
  cartButton: {
    borderRadius: 35,
    backgroundColor: "#007AFF",
    width: "67%",
    paddingTop: "1%",
    paddingBottom: "1%",
    marginTop: 4,
    marginBottom: 3,
  },
  noProductsText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
  merchantName: {
    fontSize: 14,
    color: "#888",
  },
  modalView: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 50,
    borderRadius: 10,
    padding: 20,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#000",
  },
  pickerContainer: {
    marginBottom: 20,
    zIndex: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  dropDownPicker: {
    backgroundColor: "#fafafa",
  },
  filterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  filterItemText: {
    fontSize: 16,
    color: "#000",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: "#E63946",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  resultsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
