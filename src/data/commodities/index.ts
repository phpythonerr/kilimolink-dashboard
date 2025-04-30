// Placeholder function to fetch commodity categories
// Replace this with your actual database query logic

// Define the expected return type
type Category = {
  id: string;
  name: string;
};

export async function getCommodityCategories(): Promise<Category[]> {
  console.log("Fetching commodity categories...");
  // Simulate fetching data
  // In a real application, you would fetch this from your database (e.g., using Prisma, Drizzle, etc.)
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate network delay

  // Return placeholder data - replace with actual data fetching result
  const placeholderCategories: Category[] = [
    { id: "cat_1", name: "Fruits" },
    { id: "cat_2", name: "Vegetables" },
    { id: "cat_3", name: "Dairy" },
    { id: "cat_4", name: "Bakery" },
  ];

  return placeholderCategories;
}
