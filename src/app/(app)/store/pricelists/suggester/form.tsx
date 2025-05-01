"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchCommoditiesByCategories,
  getPriceSuggestion,
  getBatchPriceSuggestions,
  savePrices,
  fetchPricelists,
  fetchPricesFromPricelist,
  type CommodityBasic,
  type PriceSuggestion,
  type Pricelist,
} from "./actions";
import { PricelistPdf } from "./pricelist-pdf";
import { PDFDownloadLink } from "@react-pdf/renderer";

interface Category {
  id: string;
  name: string;
}

interface Commodity extends CommodityBasic {
  suggestedPrice?: number;
  currentPrice?: number;
  lastYearPrice?: number;
  nextPeriodPrice?: number;
  customPrice?: number;
  margin?: number;
  loading?: boolean;
  comparisonPrice?: number; // Price from the selected pricelist
  priceChangePercent?: number; // Percent change from comparison price
}

interface FormProps {
  categories: Category[];
}

export default function Form({ categories }: FormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [defaultMargin, setDefaultMargin] = useState(40); // Default margin percentage
  const [marginInputValue, setMarginInputValue] = useState("40"); // Separate state for input value

  // New state variables for comparison feature
  const [compareWithPricelist, setCompareWithPricelist] = useState(false);
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [selectedPricelistId, setSelectedPricelistId] = useState<string | null>(
    null
  );
  const [loadingPricelists, setLoadingPricelists] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Add search term state

  // New state for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPricelistName, setNewPricelistName] = useState("");
  const [selectedPricelistForUpdate, setSelectedPricelistForUpdate] =
    useState<string>("");
  const [customerName, setCustomerName] = useState("");

  // Calculate price based on cost and margin
  const calculatePriceWithMargin = (cost: number, margin: number) => {
    return cost * (1 + margin / 100);
  };

  // Apply default margin to all commodities
  const applyDefaultMarginToAll = () => {
    // Parse the input value when applying
    const marginValue = parseFloat(marginInputValue) || 0;
    setDefaultMargin(marginValue); // Update the actual margin state

    setCommodities((prev) =>
      prev.map((commodity: any) => {
        // Only update if we have a current price to calculate from
        if (commodity.currentPrice !== undefined) {
          return {
            ...commodity,
            margin: marginValue,
            customPrice: calculatePriceWithMargin(
              commodity.currentPrice,
              marginValue
            ),
          };
        }
        return {
          ...commodity,
          margin: marginValue,
        };
      })
    );
  };

  // Handle input change without applying the margin
  const handleMarginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarginInputValue(e.target.value);
  };

  // Format number as currency
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return "";
    return `Ksh ${value.toFixed(2)}`;
  };

  // Parse currency string back to number
  const parseCurrencyValue = (value: string): number => {
    // Remove currency symbol and any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    return parseFloat(numericValue) || 0;
  };

  // Format percentage change with color
  const formatPercentChange = (change: number | undefined): JSX.Element => {
    if (change === undefined) return <span>—</span>;

    const isPositive = change >= 0;
    const color = isPositive ? "text-green-600" : "text-red-600";
    const sign = isPositive ? "+" : "";

    return (
      <span className={color}>
        {sign}
        {change.toFixed(2)}%
      </span>
    );
  };

  // Filter commodities based on search term
  const filteredCommodities = useMemo(() => {
    // First sort alphabetically by name
    const sorted = [...commodities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Then filter by search term if it exists
    if (!searchTerm.trim()) {
      return sorted;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return sorted.filter((commodity) =>
      commodity.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [commodities, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Effect to fetch commodities when selected categories change
  useEffect(() => {
    async function loadCommodities() {
      if (selectedCategories.length === 0) {
        setCommodities([]);
        return;
      }

      setLoading(true);
      try {
        // Use server action to fetch commodities
        const commoditiesData = await fetchCommoditiesByCategories(
          selectedCategories
        );

        // Initialize commodities without suggested prices yet
        setCommodities(
          commoditiesData.map((item: any) => ({
            ...item,
            loading: true,
          }))
        );

        // Use batch processing instead of individual calls
        try {
          // Get all commodity IDs
          const commodityIds = commoditiesData.map(
            (commodity: any) => commodity.id
          );

          // Use the batch function to get all suggestions at once
          const batchSuggestions = await getBatchPriceSuggestions(commodityIds);

          // Update all commodities with their suggestions
          setCommodities((prev) =>
            prev.map((commodity: any) => {
              const suggestion = batchSuggestions[commodity.id];

              if (suggestion) {
                // Use the current defaultMargin instead of recalculating
                return {
                  ...commodity,
                  suggestedPrice: suggestion.suggestedPrice,
                  currentPrice: suggestion.currentAveragePrice,
                  lastYearPrice:
                    suggestion.lastYearSamePeriodPrice || undefined,
                  nextPeriodPrice:
                    suggestion.lastYearNextPeriodPrice || undefined,
                  customPrice: suggestion.suggestedPrice, // Use suggested price initially
                  margin: defaultMargin, // Set initial margin
                  loading: false,
                };
              }

              // If suggestion wasn't found for this commodity
              return {
                ...commodity,
                margin: defaultMargin,
                loading: false,
              };
            })
          );
        } catch (err) {
          console.error("Error calculating batch prices:", err);
          setCommodities((prev) =>
            prev.map((c: any) => ({ ...c, loading: false }))
          );
          toast.error("Failed to calculate prices for some products");
        }
      } catch (error) {
        console.error("Error fetching commodities:", error);
        toast.error("Failed to fetch commodities");
      } finally {
        setLoading(false);
      }
    }

    loadCommodities();
  }, [selectedCategories]); // Remove defaultMargin dependency

  // Fetch available pricelists when component mounts
  useEffect(() => {
    async function loadPricelists() {
      if (!compareWithPricelist) return;

      setLoadingPricelists(true);
      try {
        const data = await fetchPricelists();
        setPricelists(data);

        // Auto-select the most recent pricelist if available
        if (data.length > 0 && !selectedPricelistId) {
          setSelectedPricelistId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching pricelists:", error);
        toast.error("Failed to load pricelists");
      } finally {
        setLoadingPricelists(false);
      }
    }

    loadPricelists();
  }, [compareWithPricelist]);

  // Fetch comparison prices when a pricelist is selected
  useEffect(() => {
    async function fetchComparisonPrices() {
      if (!selectedPricelistId || commodities.length === 0) return;

      setLoadingComparison(true);
      try {
        const commodityIds = commodities.map((c: any) => c.id);
        const priceMap = await fetchPricesFromPricelist(
          selectedPricelistId,
          commodityIds
        );

        setCommodities((prev) =>
          prev.map((commodity: any) => {
            const comparisonPrice = priceMap[commodity.id];
            let priceChangePercent: number | undefined;

            if (commodity.customPrice !== undefined && comparisonPrice) {
              priceChangePercent =
                (commodity.customPrice / comparisonPrice - 1) * 100;
            }

            return {
              ...commodity,
              comparisonPrice,
              priceChangePercent,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching comparison prices:", error);
        toast.error("Failed to load comparison prices");
      } finally {
        setLoadingComparison(false);
      }
    }

    fetchComparisonPrices();
  }, [selectedPricelistId, commodities.length]);

  // Update percent changes when custom prices change
  useEffect(() => {
    if (!selectedPricelistId) return;

    setCommodities((prev) =>
      prev.map((commodity: any) => {
        if (
          commodity.customPrice === undefined ||
          commodity.comparisonPrice === undefined
        ) {
          return commodity;
        }

        const priceChangePercent =
          (commodity.customPrice / commodity.comparisonPrice - 1) * 100;
        return { ...commodity, priceChangePercent };
      })
    );
  }, [
    commodities.map((c: any) => c.customPrice).join(","),
    selectedPricelistId,
  ]);

  const handleMarginChange = (commodityId: string, value: string) => {
    const marginValue = parseFloat(value) || 0;
    setCommodities((prev) =>
      prev.map((c: any) => {
        if (c.id === commodityId) {
          // Update margin and recalculate custom price based on current price
          return {
            ...c,
            margin: marginValue,
            customPrice: c.currentPrice
              ? calculatePriceWithMargin(c.currentPrice, marginValue)
              : c.customPrice,
          };
        }
        return c;
      })
    );
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, categoryId];
      } else {
        return prev.filter((id) => id !== categoryId);
      }
    });
  };

  const handlePriceChange = (commodityId: string, value: string) => {
    const numValue = parseCurrencyValue(value);
    setCommodities((prev) =>
      prev.map((c: any) => {
        if (c.id === commodityId) {
          // Update custom price and recalculate margin if current price exists
          let updatedMargin = c.margin;
          if (c.currentPrice && c.currentPrice > 0) {
            updatedMargin = (numValue / c.currentPrice - 1) * 100;
          }
          return { ...c, customPrice: numValue, margin: updatedMargin };
        }
        return c;
      })
    );
  };

  const handleUsePrices = () => {
    if (
      commodities.filter(
        (c) => c.customPrice !== undefined && c.customPrice > 0
      ).length === 0
    ) {
      toast.error(
        "Please set prices for at least one product before proceeding"
      );
      return;
    }
    setDialogOpen(true);
  };

  const handleCreatePricelist = async () => {
    if (!newPricelistName.trim()) {
      toast.error("Please enter a name for the pricelist");
      return;
    }

    setSavingPrices(true);
    try {
      // Logic for creating a new pricelist will be added later
      const commoditiesWithPrices = commodities.filter(
        (c) => c.customPrice !== undefined && c.customPrice > 0
      );

      // Format data for the server action
      const priceData = commoditiesWithPrices.map((c: any) => ({
        commodityId: c.id,
        price: c.customPrice as number,
      }));

      // Call server action to save prices (will be updated)
      const result = await savePrices(priceData);

      if (result.success) {
        toast.success(`Successfully created pricelist: ${newPricelistName}`);
        setDialogOpen(false);
        setNewPricelistName("");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Error creating pricelist:", error);
      toast.error(
        `Failed to create pricelist: ${error.message || "Unknown error"}`
      );
    } finally {
      setSavingPrices(false);
    }
  };

  const handleUpdatePricelist = async () => {
    if (!selectedPricelistForUpdate) {
      toast.error("Please select a pricelist to update");
      return;
    }

    setSavingPrices(true);
    try {
      // Logic for updating an existing pricelist will be added later
      const commoditiesWithPrices = commodities.filter(
        (c) => c.customPrice !== undefined && c.customPrice > 0
      );

      // Format data for the server action
      const priceData = commoditiesWithPrices.map((c: any) => ({
        commodityId: c.id,
        price: c.customPrice as number,
      }));

      // Call server action to save prices (will be updated)
      const result = await savePrices(priceData);

      if (result.success) {
        toast.success(`Successfully updated pricelist`);
        setDialogOpen(false);
        setSelectedPricelistForUpdate("");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Error updating pricelist:", error);
      toast.error(
        `Failed to update pricelist: ${error.message || "Unknown error"}`
      );
    } finally {
      setSavingPrices(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Categories</CardTitle>
          <CardDescription>
            Choose product categories to generate price suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category: any) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading commodities and calculating prices...</span>
        </div>
      )}

      {commodities.length > 0 && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Prices</CardTitle>
            <CardDescription>
              Review and adjust suggested prices based on your knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              <div>
                <Label htmlFor="default-margin">Default Margin (%)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="default-margin"
                    type="number"
                    min="0"
                    step="1"
                    className="w-32"
                    value={marginInputValue}
                    onChange={handleMarginInputChange}
                  />
                  <span>%</span>
                  <Button
                    variant="outline"
                    onClick={applyDefaultMarginToAll}
                    className="ml-2"
                  >
                    Apply to All
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compare-prices"
                    checked={compareWithPricelist}
                    onCheckedChange={setCompareWithPricelist}
                  />
                  <Label htmlFor="compare-prices">
                    Compare with existing pricelist
                  </Label>
                </div>

                {compareWithPricelist && (
                  <div className="w-[200px]">
                    <Select
                      disabled={loadingPricelists || pricelists.length === 0}
                      value={selectedPricelistId || undefined}
                      onValueChange={setSelectedPricelistId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricelist" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingPricelists ? (
                          <SelectItem value="loading" disabled>
                            Loading pricelists...
                          </SelectItem>
                        ) : pricelists.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No pricelists found
                          </SelectItem>
                        ) : (
                          pricelists.map((list: any) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {loadingComparison && (
              <div className="flex items-center justify-center py-4">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">Loading comparison prices...</span>
              </div>
            )}

            <div className="mt-6 overflow-auto">
              <div className="mb-4">
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by product name"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Avg. Cost</TableHead>
                    <TableHead>Suggested Price</TableHead>
                    {compareWithPricelist && selectedPricelistId && (
                      <TableHead>Current Price</TableHead>
                    )}
                    <TableHead>Margin (%)</TableHead>
                    <TableHead>Custom Price</TableHead>
                    {compareWithPricelist && selectedPricelistId && (
                      <TableHead>Change %</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommodities.map((commodity: any) => (
                    <TableRow key={commodity.id}>
                      <TableCell>{commodity.name}</TableCell>
                      <TableCell>
                        {commodity.loading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : commodity.currentPrice !== undefined ? (
                          formatCurrency(commodity.currentPrice)
                        ) : (
                          "No data"
                        )}
                      </TableCell>
                      <TableCell>
                        {commodity.loading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : commodity.suggestedPrice !== undefined ? (
                          <div>
                            <div className="font-medium">
                              {formatCurrency(commodity.suggestedPrice)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {commodity.lastYearPrice &&
                                `Last year: ${formatCurrency(
                                  commodity.lastYearPrice
                                )}`}
                            </div>
                          </div>
                        ) : (
                          "Unable to calculate"
                        )}
                      </TableCell>

                      {compareWithPricelist && selectedPricelistId && (
                        <TableCell>
                          {loadingComparison ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : commodity.comparisonPrice !== undefined ? (
                            formatCurrency(commodity.comparisonPrice)
                          ) : (
                            "Not in pricelist"
                          )}
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            className="w-20"
                            value={
                              commodity.margin !== undefined
                                ? commodity.margin
                                : ""
                            }
                            onChange={(e) =>
                              handleMarginChange(commodity.id, e.target.value)
                            }
                            disabled={
                              commodity.loading ||
                              commodity.currentPrice === undefined
                            }
                          />
                          <span>%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Input
                            type="text"
                            className="pl-9"
                            value={
                              commodity.customPrice !== undefined
                                ? formatCurrency(commodity.customPrice)
                                : ""
                            }
                            onChange={(e) =>
                              handlePriceChange(commodity.id, e.target.value)
                            }
                            disabled={commodity.loading}
                            onFocus={(e) => {
                              // Optional: Select all text when focused for easy editing
                              e.target.select();
                            }}
                          />
                          {commodity.customPrice === undefined && (
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              Ksh
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {compareWithPricelist && selectedPricelistId && (
                        <TableCell>
                          {formatPercentChange(commodity.priceChangePercent)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-start">
              <Button
                onClick={handleUsePrices}
                disabled={savingPrices || commodities.length === 0}
              >
                {savingPrices && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Use Prices
              </Button>

              {/* Dialog for price actions */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Price List Options</DialogTitle>
                    <DialogDescription>
                      Choose what you would like to do with these prices.
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="create">New Pricelist</TabsTrigger>
                      <TabsTrigger value="update">Update Pricelist</TabsTrigger>
                      <TabsTrigger value="pdf">Export PDF</TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-pricelist-name">
                          Pricelist Name
                        </Label>
                        <Input
                          id="new-pricelist-name"
                          placeholder="Enter a name for the new pricelist"
                          value={newPricelistName}
                          onChange={(e) => setNewPricelistName(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleCreatePricelist}
                        disabled={savingPrices || !newPricelistName.trim()}
                        className="w-full"
                      >
                        {savingPrices && (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Pricelist
                      </Button>
                    </TabsContent>

                    <TabsContent value="update" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Select Pricelist to Update</Label>
                        <Select
                          value={selectedPricelistForUpdate}
                          onValueChange={setSelectedPricelistForUpdate}
                          disabled={
                            loadingPricelists || pricelists.length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pricelist" />
                          </SelectTrigger>
                          <SelectContent>
                            {pricelists.map((list: any) => (
                              <SelectItem key={list.id} value={list.id}>
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleUpdatePricelist}
                        disabled={savingPrices || !selectedPricelistForUpdate}
                        className="w-full"
                      >
                        {savingPrices && (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Pricelist
                      </Button>
                    </TabsContent>

                    <TabsContent value="pdf" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input
                          id="customer-name"
                          placeholder="Enter customer name for PDF"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="pt-2">
                        <PDFDownloadLink
                          document={
                            <PricelistPdf
                              commodities={filteredCommodities}
                              customerName={customerName || "Customer"}
                              showComparison={
                                compareWithPricelist && !!selectedPricelistId
                              }
                              date={new Date().toLocaleDateString()}
                            />
                          }
                          fileName={`pricelist-${customerName || "customer"}-${
                            new Date().toISOString().split("T")[0]
                          }.pdf`}
                          className="w-full"
                        >
                          {({ loading, error }) => (
                            <Button
                              disabled={loading}
                              className="w-full"
                              variant="default"
                            >
                              {loading ? (
                                <>
                                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                  Generating PDF...
                                </>
                              ) : (
                                "Download PDF"
                              )}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
