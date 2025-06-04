import React from "react";
import {
  Font,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { CommodityBasic } from "./actions";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // Or your actual base URL

Font.register({
  family: "Geist Sans",
  fonts: [
    {
      src: `${baseUrl}/fonts/Geist/static/Geist-Regular.ttf`, // Verify actual filename
      fontWeight: "normal",
    },
    {
      src: `${baseUrl}/fonts/Geist/static/Geist-Bold.ttf`, // Verify actual filename
      fontWeight: "bold",
    },
    // Add other weights (e.g., 'semibold', 'medium') if needed and available
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Geist Sans",
    flexDirection: "column",
    backgroundColor: "white",
    padding: 30,
  },
  header: {
    fontFamily: "Geist Sans",
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#112233",
    paddingBottom: 10,
    alignItems: "center",
  },
  logoContainer: {
    fontFamily: "Geist Sans",
    width: 120,
    marginRight: 20,
  },
  logo: {
    fontFamily: "Geist Sans",
    width: "100%",
    height: "auto",
  },
  headerText: {
    fontFamily: "Geist Sans",
    flex: 1,
  },
  title: {
    fontFamily: "Geist Sans",
    fontSize: 24,
    fontWeight: "bold",
    color: "#112233",
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: "Geist Sans",
    fontSize: 12,
    color: "#666666",
    marginBottom: 3,
  },
  customerInfo: {
    fontFamily: "Geist Sans",
    marginBottom: 20,
  },
  customerName: {
    fontFamily: "Geist Sans",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    fontFamily: "Geist Sans",
    fontSize: 10,
    color: "#666666",
  },
  table: {
    fontFamily: "Geist Sans",
    // Replace "table" with "flex" as "table" is not a valid display value in react-pdf
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginTop: 10,
  },
  tableRow: {
    fontFamily: "Geist Sans",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
  },
  tableRowHeader: {
    fontFamily: "Geist Sans",
    backgroundColor: "#F3F4F6",
  },
  // Add styles for rows with price changes
  tableRowIncrease: {
    fontFamily: "Geist Sans",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    backgroundColor: "#FEF2F2", // Light red background for price increases
  },
  tableRowDecrease: {
    fontFamily: "Geist Sans",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    backgroundColor: "#ECFDF5", // Light green background for price decreases
  },
  tableCol: {
    fontFamily: "Geist Sans",
    padding: 8,
  },
  tableColNumber: {
    fontFamily: "Geist Sans",
    width: "5%",
    borderRightWidth: 1,
    borderRightColor: "#DDDDDD",
    padding: 8,
    textAlign: "center",
  },
  tableColProduct: {
    fontFamily: "Geist Sans",
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#DDDDDD",
    padding: 8,
  },
  tableColPrice: {
    fontFamily: "Geist Sans",
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#DDDDDD",
    padding: 8,
    textAlign: "right",
  },
  tableColCompare: {
    fontFamily: "Geist Sans",
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#DDDDDD",
    padding: 8,
    textAlign: "right",
  },
  tableColChange: {
    fontFamily: "Geist Sans",
    width: "10%",
    padding: 8,
    textAlign: "right",
  },
  tableHeader: {
    fontFamily: "Geist Sans",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    fontFamily: "Geist Sans",
    fontSize: 8,
    color: "#333333",
  },
  increase: {
    fontFamily: "Geist Sans",
    color: "#047857", // green
  },
  decrease: {
    fontFamily: "Geist Sans",
    color: "#DC2626", // red
  },
  footer: {
    fontFamily: "Geist Sans",
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
    paddingTop: 10,
  },
  pageNumber: {
    fontFamily: "Geist Sans",
    position: "absolute",
    bottom: 10,
    right: 30,
    fontSize: 10,
    color: "#666666",
  },
});

interface PricelistPdfProps {
  commodities: Array<{
    id: string;
    name: string;
    customPrice?: number;
    currentPrice?: number;
    suggestedPrice?: number;
    margin?: number;
    comparisonPrice?: number;
    priceChangePercent?: number;
  }>;
  customerName: string;
  showComparison: boolean;
  columns: {
    product: boolean;
    currentPrice: boolean;
    suggestedPrice: boolean;
    customPrice: boolean;
    margin: boolean;
    change: boolean;
    comparisonPrice: boolean;
  };
  date: string;
}

export const PricelistPdf: React.FC<PricelistPdfProps> = ({
  commodities,
  customerName,
  showComparison,
  columns,
  date,
}) => {
  // Filter out commodities without prices
  const commoditiesWithPrices = commodities.filter(
    (c) => c.customPrice !== undefined && c.customPrice > 0
  );

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "-";
    return `Ksh ${value.toFixed(2)}`;
  };

  // Calculate dynamic column widths based on selection
  const calculateColumnWidths = () => {
    // Count the number of selected columns
    let selectedColumnsCount = 1; // Start with 1 for the product column which is always included
    // Note: Number column (5%) is not included in this calculation

    if (columns.currentPrice) selectedColumnsCount++;
    if (columns.suggestedPrice) selectedColumnsCount++;
    if (columns.customPrice) selectedColumnsCount++;
    if (columns.margin) selectedColumnsCount++;
    if (showComparison && columns.comparisonPrice) selectedColumnsCount++;
    if (showComparison && columns.change) selectedColumnsCount++;

    // Calculate remaining width after number column (5%) and product column (35%)
    const productColumnWidth = "35%";
    const remainingColumns = selectedColumnsCount - 1;
    const remainingWidth = 60; // 100% - 5% - 35% = 60%

    // Distribute remaining width evenly
    const otherColumnWidth =
      remainingColumns > 0 ? `${remainingWidth / remainingColumns}%` : "0%";

    return {
      product: productColumnWidth,
      other: otherColumnWidth,
    };
  };

  const columnWidths = calculateColumnWidths();

  // Determine which style to use for each row based on price change
  const getRowStyle = (commodity: any) => {
    // Only apply highlighting when comparing prices and there's a change percentage available
    if (showComparison && commodity.priceChangePercent !== undefined) {
      // Price increase (red background)
      if (commodity.priceChangePercent > 0) {
        return styles.tableRowIncrease;
      }
      // Price decrease (green background)
      else if (commodity.priceChangePercent < 0) {
        return styles.tableRowDecrease;
      }
    }
    // Default row style
    return styles.tableRow;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              src="https://www.kilimolink.com/img/logo/logo-primary-by-lolkirr.png" // Use absolute URL
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Price List</Text>
            {/* <Text style={styles.subtitle}>sales@kilimolink.shop</Text> */}
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.date}>
            Date:{" "}
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ ...styles.tableColNumber, width: "5%" }}>
              <Text style={styles.tableHeader}>#</Text>
            </View>
            <View
              style={{ ...styles.tableColProduct, width: columnWidths.product }}
            >
              <Text style={styles.tableHeader}>Product</Text>
            </View>

            {columns.currentPrice && (
              <View
                style={{ ...styles.tableColPrice, width: columnWidths.other }}
              >
                <Text style={styles.tableHeader}>Current Avg. Cost</Text>
              </View>
            )}

            {columns.suggestedPrice && (
              <View
                style={{ ...styles.tableColPrice, width: columnWidths.other }}
              >
                <Text style={styles.tableHeader}>Suggested Price</Text>
              </View>
            )}

            {showComparison && columns.comparisonPrice && (
              <View
                style={{ ...styles.tableColPrice, width: columnWidths.other }}
              >
                <Text style={styles.tableHeader}>Previous Price</Text>
              </View>
            )}

            {columns.customPrice && (
              <View
                style={{ ...styles.tableColPrice, width: columnWidths.other }}
              >
                <Text style={styles.tableHeader}>
                  {showComparison ? "Current Price" : "Price"}
                </Text>
              </View>
            )}

            {columns.margin && (
              <View
                style={{ ...styles.tableColPrice, width: columnWidths.other }}
              >
                <Text style={styles.tableHeader}>Margin (%)</Text>
              </View>
            )}

            {showComparison && columns.change && (
              <View
                style={{ ...styles.tableColChange, width: columnWidths.other }}
              >
                <Text style={styles.tableHeader}>Change %</Text>
              </View>
            )}
          </View>

          {/* Table Rows */}
          {commoditiesWithPrices.map((commodity: any, index: number) => (
            <View key={commodity.id} style={getRowStyle(commodity)}>
              <View style={{ ...styles.tableColNumber, width: "5%" }}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View
                style={{
                  ...styles.tableColProduct,
                  width: columnWidths.product,
                }}
              >
                <Text style={styles.tableCell}>{commodity.name}</Text>
              </View>

              {columns.currentPrice && (
                <View
                  style={{ ...styles.tableColPrice, width: columnWidths.other }}
                >
                  <Text style={styles.tableCell}>
                    {formatCurrency(commodity.currentPrice)}
                  </Text>
                </View>
              )}

              {columns.suggestedPrice && (
                <View
                  style={{ ...styles.tableColPrice, width: columnWidths.other }}
                >
                  <Text style={styles.tableCell}>
                    {formatCurrency(commodity.suggestedPrice)}
                  </Text>
                </View>
              )}

              {showComparison && columns.comparisonPrice && (
                <View
                  style={{ ...styles.tableColPrice, width: columnWidths.other }}
                >
                  <Text style={styles.tableCell}>
                    {formatCurrency(commodity.comparisonPrice)}
                  </Text>
                </View>
              )}

              {columns.customPrice && (
                <View
                  style={{ ...styles.tableColPrice, width: columnWidths.other }}
                >
                  <Text style={styles.tableCell}>
                    {formatCurrency(commodity.customPrice)}
                  </Text>
                </View>
              )}

              {columns.margin && (
                <View
                  style={{ ...styles.tableColPrice, width: columnWidths.other }}
                >
                  <Text style={styles.tableCell}>
                    {commodity.margin !== undefined
                      ? `${commodity.margin.toFixed(2)}%`
                      : "-"}
                  </Text>
                </View>
              )}

              {showComparison && columns.change && (
                <View
                  style={{
                    ...styles.tableColChange,
                    width: columnWidths.other,
                  }}
                >
                  {commodity.priceChangePercent !== undefined ? (
                    <Text
                      style={[
                        styles.tableCell,
                        commodity.priceChangePercent >= 0
                          ? styles.increase
                          : styles.decrease,
                      ]}
                    >
                      {commodity.priceChangePercent >= 0 ? "+" : ""}
                      {commodity.priceChangePercent.toFixed(2)}%
                    </Text>
                  ) : (
                    <Text style={styles.tableCell}>-</Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* <View style={styles.footer}>
          <Text>
            This price list is valid until{" "}
            {new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toLocaleDateString()}
            . Prices subject to change without notice.
          </Text>
        </View> */}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
