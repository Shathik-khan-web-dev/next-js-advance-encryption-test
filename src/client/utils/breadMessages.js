export const getRelatedMessage = (category) => {
  if (!category) return "Check out our new arrivals!";

  // Customize these messages based on your categories
  const relatedMessages = {
    "men-tshirt": "Check out our new arrivals for Men's T-shirts!",
    "women-tshirt": "Check out our new arrivals for Women's T-shirts!",
    "phone-case": "Explore our latest collection of Phone Cases!",
    "new-arrivals": "Discover our newest products just for you!",
  };

  return relatedMessages[category] || "Check out our new arrivals!";
};
