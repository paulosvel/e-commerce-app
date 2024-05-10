import axios from "axios";
import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";

export default function ProductDetailsComponent({ route }) {
  const { categoryUuid, subCategoryUuid } = route.params;
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url =
          "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/basket-retailers/prices.json";
        const response = await axios.get(url);
        const allProducts = response.data.context.MAPP_PRODUCTS.result.products;

        // console.log("Fetched products:", allProducts);
        allProducts.forEach((product) => {
          if (!product.category || !Array.isArray(product.category)) {
            // console.log("Invalid product categories:", product);
          }
        });

        const filteredProducts = allProducts.filter(
          (products) =>
            Array.isArray(products.category) &&
            products.category.includes(parseInt(categoryUuid)) &&
            (!subCategoryUuid ||
              products.category.includes(parseInt(subCategoryUuid)))
        );

        // console.log("Filtered products:", filteredProducts);
        setProducts(filteredProducts);
        filteredProducts.forEach((product) => {
          if (product.image) {
            console.log("Product Image URL:", product.image);
          }
        });
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [categoryUuid, subCategoryUuid]);

  return (
    <ScrollView>
      {products.map((product) => (
        <View key={product.id}>
          <Text>{product.name}</Text>
          <Text>{product.price}</Text>
          {product.image && (
            <Image
              source={{ uri: product.image }}
              style={{ width: 100, height: 100 }}
            />
          )}
        </View>
      ))}
      {products.length === 0 && (
        <Text>
          No products found for the selected category and sub-category.
        </Text>
      )}
    </ScrollView>
  );
}
