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
import FilterButton from "./FilterButton";

export default function ProductDetailsComponent({ route }) {
  const { categoryUuid, subCategoryUuid } = route.params;
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [selectedSubSubCategories, setSelectedSubSubCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

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
  }, [selectedMerchant, selectedSubSubCategories]);

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

  const getMinimumPrice = (prices, selectedMerchant) => {
    if (!prices || prices.length === 0) return "N/A";

    if (selectedMerchant) {
      const merchantPrice = prices.find(
        (price) => price.merchant_uuid === selectedMerchant
      );
      if (merchantPrice) {
        return merchantPrice.price.toFixed(2);
      }
    }

    const minPrice = Math.min(...prices.map((price) => price.price));
    return minPrice.toFixed(2);
  };

  const applyFilters = () => {
    const filteredProducts = allProducts.filter((product) => {
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

    setProducts(filteredProducts);
  };

  const getMerchantCount = (product) => {
    const merchantIDs = product.prices.map((price) => price.merchant_uuid);
    const uniqueMerchants = new Set(merchantIDs);
    return uniqueMerchants.size;
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
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
                {getMinimumPrice(product.prices, selectedMerchant)}€
              </Text>
            </View>
            <TouchableOpacity style={styles.cartIcon}>
              <Feather name="shopping-cart" size={24} color="white" />
            </TouchableOpacity>
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
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="closecircle" size={24} color="black" />
              </TouchableOpacity>
              <Text style={{ fontSize: 24 }}>Φίλτρα</Text>
            </View>
            <ScrollView>
              {merchants.map((merchant) => (
                <TouchableOpacity
                  key={merchant.merchant_uuid}
                  onPress={() => toggleMerchant(merchant.merchant_uuid)}
                  style={styles.merchantItem}
                >
                  <Text style={styles.merchantText}>
                    {merchant.display_name}
                  </Text>
                  {selectedMerchant.includes(merchant.merchant_uuid) ? (
                    <AntDesign name="checkcircle" size={24} color="#E63946" />
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
              <View style={styles.divider} />
              {subSubCategories.map((subSubCategory) => (
                <TouchableOpacity
                  key={subSubCategory.uuid}
                  onPress={() => toggleSubSubCategory(subSubCategory.uuid)}
                  style={styles.merchantItem}
                >
                  <Text style={styles.merchantText}>{subSubCategory.name}</Text>
                  {selectedSubSubCategories.includes(subSubCategory.uuid) ? (
                    <AntDesign name="checkcircle" size={24} color="#E63946" />
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
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                marginTop: "5%",
              }}
            >
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
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 14,
    color: "#E63946",
  },
  cartIcon: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#007AFF",
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
    paddingTop: "20%",
  },
  closeButton: {
    alignSelf: "flex-start",
    margin: 16,
  },
  merchantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  merchantText: {
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#E63946",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  resultsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  merchantList: {
    padding: 10,
    backgroundColor: "#FFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
});
