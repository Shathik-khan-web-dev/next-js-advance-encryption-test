import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productData: [],
};

export const nextSlice = createSlice({
  name: "next",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingProduct = state.productData.find(
        (item) => item === action.payload.productId
      );
      if (!existingProduct) {
        state.productData.push(action.payload.productId);
      }
    },

    removeProduct: (state, action) => {
      state.productData = state.productData.filter(
        (item) => item !== action.payload
      );
    },

    resetCart: (state) => {
      state.productData = [];
    },
  },
});

export const { addToCart, removeProduct, resetCart } = nextSlice.actions;

export default nextSlice.reducer;
