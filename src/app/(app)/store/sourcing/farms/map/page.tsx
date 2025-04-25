import MapComponent from "./map";

// TODO: Replace with actual Supabase client and data fetching logic
async function getFarms() {
  // Placeholder data - replace with actual fetch from 'farms_farm' table
  console.log("Fetching farms from database...");
  // Example: const { data, error } = await supabase.from('farms_farm').select('id, name, latitude, longitude');
  // if (error) { console.error('Error fetching farms:', error); return []; }
  // return data;
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  return [
    { id: 1, name: "Farm A", latitude: -1.286389, longitude: 36.817223 }, // Nairobi approx
    { id: 2, name: "Farm B", latitude: -0.091702, longitude: 34.767956 }, // Kisumu approx
    { id: 3, name: "Farm C", latitude: -4.043477, longitude: 39.668205 }, // Mombasa approx
  ];
}

export default async function FarmsMapPage() {
  const farms = await getFarms();

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-theme(space.16))]">
      <h1 className="text-2xl font-bold mb-4">Farm Locations Map</h1>
      <div className="h-full w-full">
        <MapComponent farms={farms} />
      </div>
    </div>
  );
}
