"use client";

import Address from "./Address";
import MyFavorite from "./MyFavorite";
import AddToCart from "./AddToCart";
import OrdersHistory from "./OrdersHistory";

const ContentSection = ({ selectedSection }) => {
  switch (selectedSection) {
    case "AddToCart":
      return <AddToCart />;
    case "MyFavorite":
      return <MyFavorite />;
    case "OrdersHistory":
      return <OrdersHistory />;
    case "Address":
      return <Address />;
    default:
      return <AddToCart />;
  }
};

export default ContentSection;
