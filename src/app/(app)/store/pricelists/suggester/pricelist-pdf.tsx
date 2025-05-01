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
  tableCol: {
    fontFamily: "Geist Sans",
    padding: 8,
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
    comparisonPrice?: number;
    priceChangePercent?: number;
  }>;
  customerName: string;
  showComparison: boolean;
  date: string;
}

export const PricelistPdf: React.FC<PricelistPdfProps> = ({
  commodities,
  customerName,
  showComparison,
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
            <Text style={styles.subtitle}>sales@kilimolink.shop</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={styles.tableColProduct}>
              <Text style={styles.tableHeader}>Product</Text>
            </View>
            {showComparison && (
              <>
                <View style={styles.tableColCompare}>
                  <Text style={styles.tableHeader}>Previous Price</Text>
                </View>
                <View style={styles.tableColPrice}>
                  <Text style={styles.tableHeader}>Current Price</Text>
                </View>
                <View style={styles.tableColChange}>
                  <Text style={styles.tableHeader}>Change %</Text>
                </View>
              </>
            )}
            {!showComparison && (
              <View style={styles.tableColPrice}>
                <Text style={styles.tableHeader}>Price</Text>
              </View>
            )}
          </View>

          {/* Table Rows */}
          {commoditiesWithPrices.map((commodity: any) => (
            <View key={commodity.id} style={styles.tableRow}>
              <View style={styles.tableColProduct}>
                <Text style={styles.tableCell}>{commodity.name}</Text>
              </View>

              {showComparison && (
                <>
                  <View style={styles.tableColCompare}>
                    <Text style={styles.tableCell}>
                      {formatCurrency(commodity.comparisonPrice)}
                    </Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text style={styles.tableCell}>
                      {formatCurrency(commodity.customPrice)}
                    </Text>
                  </View>
                  <View style={styles.tableColChange}>
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
                </>
              )}

              {!showComparison && (
                <View style={styles.tableColPrice}>
                  <Text style={styles.tableCell}>
                    {formatCurrency(commodity.customPrice)}
                  </Text>
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
