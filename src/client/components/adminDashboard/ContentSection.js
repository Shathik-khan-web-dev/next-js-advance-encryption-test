"use client";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import User from "./Users";
import Products from "./Products";
import AddToCart from "./AddToCart";
import MyFavorite from "./MyFavorite";
import Reviews from "./Reviews";

const ContentSection = ({ selectedSection }) => {
  switch (selectedSection) {
    case "Dashboard":
      return <Dashboard />;
    case "Products":
      return <Products />;
    case "Users":
      return <User />;
    case "Orders":
      return <Orders />;
    case "Reviews":
      return <Reviews />;
    case "AddToCart":
      return <AddToCart />;
    case "MyFavorite":
      return <MyFavorite />;
    default:
      return <Dashboard />;
  }
};

export default ContentSection;
