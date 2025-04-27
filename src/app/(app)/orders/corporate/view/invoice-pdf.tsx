import {
  Page,
  Text,
  View,
  Image,
  Font,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

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

const styles = StyleSheet.create({
  page: { backgroundColor: "white", fontFamily: "Geist Sans" },
  body: {
    fontFamily: "Geist Sans",
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  pageHeader: {
    fontFamily: "Geist Sans",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 8,
    color: "#1f2937",
  },
  image: {
    fontFamily: "Geist Sans",
    width: "auto",
    height: 30,
  },
  table: {
    fontFamily: "Geist Sans",
    fontSize: 8,
    color: "#374151",
  },
  thead: {
    fontFamily: "Geist Sans",
    borderTop: "1px solid #d1d5db",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "1px solid #d1d5db",
    backgroundColor: "#166534",
    color: "#fff",
  },
  row: {
    fontFamily: "Geist Sans",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "0.5px solid #d1d5db",
    borderTop: "0.5px solid #d1d5db",
  },
  col: {
    fontFamily: "Geist Sans",
    height: "100%",
    paddingHorizontal: "5px",
    paddingVertical: "8px",
  },
  footer: {
    fontFamily: "Geist Sans",
    position: "absolute",
    fontSize: 8,
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 35,
    alignItems: "center",
    justifyContent: "space-between",
    color: "#9ca3af",
  },
});

export default function Invoice({
  id,
  order_number,
  customer,
  items,
  revenue,
  bankAccount,
}: any) {
  let rowCount: number = 0;

  return (
    <Document
      title={`Invoice # ${order_number}`}
      author="Kilimolink"
      subject={`Invoice # ${order_number}`}
    >
      <Page size="A4" style={styles.body} wrap>
        <View>
          <View style={styles.pageHeader}>
            <View>
              <Image
                src="https://www.kilimolink.com/img/logo/logo-primary-by-lolkirr.png"
                style={{ marginBottom: 12, width: 88.72773, height: 30 }}
              />
              <View style={{ paddingVertical: 3 }}>
                <Text>LINK ROAD BUSINESS CENTRE, KIKUYU, KENYA </Text>
              </View>
              <View style={{ paddingVertical: 3 }}>
                <Text>P052315590J</Text>
              </View>
              <View style={{ paddingVertical: 3 }}>
                <Text>0705464085</Text>
              </View>
              <View style={{ paddingVertical: 3 }}>
                <Text>sales@kilimolink.shop / sales@kilimolink.com</Text>
              </View>
              <View style={{ paddingVertical: 3 }}>
                <Text>https://www.kilimolink.com</Text>
              </View>
            </View>

            <View style={{ flexDirection: "column" }}>
              <View
                style={{
                  marginBottom: 10,
                }}
              >
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "heavy",
                      paddingBottom: 3,
                    }}
                  >
                    INVOICE
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text style={{ fontSize: 8, paddingBottom: 3 }}>
                    {`# INV${items[0]?.order_id?.order_number}`}
                  </Text>
                </View>
              </View>
              <View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text
                    style={{ paddingBottom: 3, fontSize: 9, fontWeight: 800 }}
                  >
                    Balance Due
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text
                    style={{ fontSize: 11, paddingBottom: 3, fontWeight: 800 }}
                  >
                    {`KES${Number(
                      Number(
                        revenue.reduce(
                          (total: number, item: any) => total + item.amount,
                          0
                        )
                      ) +
                        Number(
                          items.reduce(
                            (total: number, item: any) =>
                              total + item.selling_price * item.quantity,
                            0
                          )
                        )
                    ).toLocaleString()}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.pageHeader}>
            <View style={{ marginBottom: 10, flex: 1 }}>
              <Text style={{ paddingVertical: 3, fontWeight: "heavy" }}>
                Bill To
              </Text>
              <Text style={{ paddingVertical: 3 }}>
                {`${customer?.user_metadata?.business_name} ${
                  items[0]?.order_id?.branch
                    ? ` - ${items[0]?.order_id?.branch}`
                    : ""
                }`}
              </Text>
              {items[0]?.order_id?.branch && (
                <Text style={{ paddingVertical: 3 }}></Text>
              )}
              {customer?.user_metadata?.kra_pin_number && (
                <Text style={{ paddingVertical: 3 }}>
                  {`PIN ${customer?.user_metadata?.kra_pin_number}`}
                </Text>
              )}
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <View style={{ paddingVertical: 1.5, flex: 1 }}>
                  <Text style={{ textAlign: "right" }}>{`Date: ${new Date(
                    items[0]?.order_id?.delivery_date
                  ).toDateString()}`}</Text>
                </View>
              </View>
              {items[0]?.order_id?.po_number &&
                items[0]?.order_id?.po_number !== "nan" && (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                    }}
                  >
                    <View style={{ paddingVertical: 1.5, flex: 1 }}>
                      <Text
                        style={{ textAlign: "right" }}
                      >{`PO Number: ${items[0]?.order_id?.po_number}`}</Text>
                    </View>
                  </View>
                )}
            </View>
          </View>
          <View style={styles.table}>
            <View
              style={[
                styles.row,
                { backgroundColor: "#1f2937", color: "#fff" },
              ]}
            >
              <View style={[styles.col, { width: "5%" }]}>
                <Text>#</Text>
              </View>
              <View style={[styles.col, { width: "35%" }]}>
                <Text>Item &amp; Description</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Qty</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Rate</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>VAT</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Amount</Text>
              </View>
            </View>
            {items.map((item: any, index: any) => {
              rowCount = rowCount + 1;
              return (
                <View key={index} style={styles.row}>
                  <View style={[styles.col, { width: "5%" }]}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View style={[styles.col, { width: "35%" }]}>
                    <Text>{item?.commodity_id?.name}</Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                      }}
                    >
                      <Text style={{ textAlign: "right" }}>
                        {Number(item?.quantity).toFixed(2)}
                      </Text>
                      <Text
                        style={{
                          color: "#6b7280",
                          paddingTop: 5,
                          fontSize: 6,
                          textAlign: "right",
                        }}
                      >
                        {item?.uom || item?.commodity_id?.quantity_unit}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {Number(
                        Number(item?.selling_price).toFixed(2)
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>-</Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {Number(
                        Number(item?.selling_price * item?.quantity).toFixed(2)
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
            {revenue.map((rev: any, index: any) => {
              rowCount = items?.length + 1;
              return (
                <View key={index} style={styles.row}>
                  <View style={[styles.col, { width: "5%" }]}>
                    <Text>{rowCount}</Text>
                  </View>
                  <View style={[styles.col, { width: "35%" }]}>
                    <Text>{rev?.revenue_type_id?.name}</Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "baseline",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Text>1</Text>
                    </View>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {rev?.vat_rule
                        ? ((rev?.amount * 100) / (1 + rev?.vat_rule)).toFixed(2)
                        : rev?.amount}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {rev?.vat_rule
                        ? (
                            rev?.amount -
                            (rev?.amount * 100) / (1 + rev?.vat_rule)
                          ).toFixed(2)
                        : "-"}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {Number(rev?.amount).toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View style={styles.row}>
              <View style={[styles.col, { width: "85%" }]}>
                <Text
                  style={{ fontSize: 8, fontWeight: 700, textAlign: "right" }}
                >
                  Total
                </Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>
                  {`KES${Number(
                    Number(
                      revenue.reduce(
                        (total: number, item: any) => total + item.amount,
                        0
                      )
                    ) +
                      Number(
                        items.reduce(
                          (total: number, item: any) =>
                            total + item.selling_price * item.quantity,
                          0
                        )
                      )
                  ).toLocaleString()}`}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 10, paddingBottom: 6 }}>
                PAYMENT INSTRUCTIONS
              </Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                Payments done in favour of Lolkirr Agritech Ltd.
              </Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 9, marginBottom: 6 }}>
                BANK DETAILS -(KES)
              </Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                {`Bank: ${bankAccount?.bank_name} - ${bankAccount?.bank_branch}`}
              </Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                {`Account Name: ${bankAccount?.acc_name}`}
              </Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                {`Swift Code: ${bankAccount?.swift_code}`}
              </Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                {`Account Number: ${bankAccount?.acc_number}`}
              </Text>
            </View>
            <View style={{}}>
              <Text style={{ fontSize: 9, marginBottom: 6 }}>MPESA</Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                {`Paybill No. ${bankAccount?.mpesa_business_number}`}
              </Text>
              <Text
                style={{ paddingVertical: 2, fontSize: 8, color: "#374151" }}
              >
                {`Account No. ${bankAccount?.mpesa_acc_number}`}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text>{`# INV${items[0]?.order_id?.order_number}`}</Text>
          <Text
            render={({ pageNumber, totalPages }: any) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text>Kilimolink</Text>
        </View>
      </Page>
    </Document>
  );
}
