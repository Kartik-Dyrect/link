/**
 * Auto-categorize a link based on its URL and domain
 * @param {string} url - The URL to categorize
 * @param {string} siteName - The site name from metadata
 * @returns {string} - The category
 */
export const categorizeLink = (url, siteName = "") => {
  const lowerUrl = url.toLowerCase();
  const lowerSiteName = siteName.toLowerCase();

  // Video category
  if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be") ||
    lowerUrl.includes("vimeo.com") ||
    lowerUrl.includes("twitch.tv")
  ) {
    return "Video";
  }

  // Recipe category
  if (
    lowerUrl.includes("/recipe") ||
    lowerUrl.includes("allrecipes.com") ||
    lowerUrl.includes("food.com") ||
    lowerUrl.includes("epicurious.com") ||
    lowerSiteName.includes("recipe")
  ) {
    return "Recipe";
  }

  // Article category
  if (
    lowerUrl.includes("medium.com") ||
    lowerUrl.includes("dev.to") ||
    lowerUrl.includes("hashnode.com") ||
    lowerUrl.includes("substack.com") ||
    lowerUrl.includes("/blog/") ||
    lowerUrl.includes("/article/") ||
    lowerSiteName.includes("blog")
  ) {
    return "Article";
  }

  // Shopping category
  if (
    lowerUrl.includes("amazon.com") ||
    lowerUrl.includes("ebay.com") ||
    lowerUrl.includes("etsy.com") ||
    lowerUrl.includes("shopify.com")
  ) {
    return "Shopping";
  }

  // Social category
  if (
    lowerUrl.includes("twitter.com") ||
    lowerUrl.includes("x.com") ||
    lowerUrl.includes("facebook.com") ||
    lowerUrl.includes("instagram.com") ||
    lowerUrl.includes("linkedin.com")
  ) {
    return "Social";
  }

  // Default category
  return "General";
};

/**
 * Get category color for UI display
 * @param {string} category - The category name
 * @returns {string} - Tailwind CSS color classes
 */
export const getCategoryColor = (category) => {
  switch (category) {
    case "Video":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "Recipe":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Article":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Shopping":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Social":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};
