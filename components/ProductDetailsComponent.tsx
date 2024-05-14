import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ProductDetailsComponent({ route }) {
  const { categoryUuid, subCategoryUuid } = route.params;
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [showMerchants, setShowMerchants] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/basket-retailers/prices.json"
        );
        const data = response.data.context.MAPP_PRODUCTS.result;

        setMerchants(data.merchants);
        setAllProducts(data.products);
        filterProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [categoryUuid, subCategoryUuid]);

  useEffect(() => {
    filterProducts(allProducts);
  }, [selectedMerchant]);

  const filterProducts = (productsToFilter) => {
    const filteredProducts = productsToFilter.filter((product) => {
      const isInCategory =
        Array.isArray(product.category) &&
        product.category.includes(parseInt(categoryUuid)) &&
        (!subCategoryUuid ||
          product.category.includes(parseInt(subCategoryUuid)));
      const isInMerchant = selectedMerchant
        ? product.prices.some(
            (price) => price.merchant_uuid === selectedMerchant
          )
        : true;
      return isInCategory && isInMerchant;
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
              <Text style={styles.productPrice}>{product.price}</Text>
              <Text style={styles.merchantName}>
                Available from {getMerchantCount(product)} merchants
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
      <TouchableOpacity
        onPress={() => setShowMerchants(!showMerchants)}
        style={styles.filterButton}
      >
        <Text>Filter</Text>
      </TouchableOpacity>
      {showMerchants && (
        <View style={styles.merchantList}>
          {merchants.map((merchant) => (
            <TouchableOpacity
              key={merchant.merchant_uuid}
              onPress={() => setSelectedMerchant(merchant.merchant_uuid)}
              style={styles.merchantItem}
            >
              <Text style={styles.merchantText}>{merchant.display_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  productInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 14,
    color: "#666",
  },
  cartIcon: {
    padding: 20,
    borderRadius: 25,
    backgroundColor: "#007AFF",
  },
  noProductsText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
  merchantName: {
    fontSize: 12,
    color: "#888",
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#DDD",
    alignItems: "center",
  },
  merchantList: {
    padding: 10,
    backgroundColor: "#FFF",
  },
  merchantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  merchantText: {
    fontSize: 16,
    color: "#000",
  },
});
