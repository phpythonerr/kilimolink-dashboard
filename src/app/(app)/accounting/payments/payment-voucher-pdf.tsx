import {
  Page,
  Text,
  View,
  Image,
  Font,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

Font.register({
  family: "Nunito Sans",
  src: "http://fonts.gstatic.com/s/nunitosans/v2/iJ4p9wO0GDKJ-D5teKuZqp0EAVxt0G0biEntp43Qt6E.ttf",
});

const styles = StyleSheet.create({
  page: { backgroundColor: "white", fontFamily: "Nunito Sans" },
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 8,
    color: "#1f2937",
  },
  image: {
    width: "auto",
    height: 30,
  },
  table: {
    fontSize: 8,
    color: "#374151",
  },
  thead: {
    borderTop: "1px solid #d1d5db",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "1px solid #d1d5db",
    backgroundColor: "#166534",
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "0.5px solid #d1d5db",
    borderTop: "0.5px solid #d1d5db",
  },
  col: {
    height: "100%",
    paddingHorizontal: "5px",
    paddingVertical: "8px",
  },
  footer: {
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

export default function PaymentVoucherPDF({ payment }: any) {
  let rowCount: number = 0;

  const getDisplayName = () => {
    let displayName = null;
    if (payment?.in_favor_of) {
      const firstName =
        payment?.in_favor_of?.user_metadata?.first_name ||
        payment?.in_favor_of?.user_metadata?.firstName ||
        "Unknown";
      const lastName =
        payment?.in_favor_of?.user_metadata?.last_name ||
        payment?.in_favor_of?.user_metadata?.lastName ||
        "Vendor";

      displayName = `${firstName} ${lastName}`;
    }

    return displayName;
  };

  const getTradeName = () => {
    return payment?.in_favor_of?.user_metadata?.tradeName;
  };

  return (
    <Document
      title={`Payment Voucher`}
      subject="Payment Voucher"
      author="Kilimolink"
    >
      <Page size="A4" style={styles.body} wrap>
        <View>
          <View style={styles.pageHeader}>
            <View>
              <Image
                src="https://www.kilimolink.com/img/logo/primary-logo.png"
                style={{ marginBottom: 12, width: 88.72773, height: 20 }}
              />
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
                      fontSize: 10,
                      fontWeight: "heavy",
                      paddingBottom: 3,
                    }}
                  >
                    Payment Voucher
                  </Text>
                </View>
              </View>
              <View></View>
            </View>
          </View>
          <View style={styles.pageHeader}>
            <View style={{ marginBottom: 10, flex: 1 }}>
              <Text style={{ paddingVertical: 3, fontWeight: "heavy" }}>
                Paid To
              </Text>
              {getTradeName() && (
                <Text style={{ paddingVertical: 3 }}>{getTradeName()}</Text>
              )}
              <Text style={{ paddingVertical: 3 }}>{getDisplayName()}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end" }}></View>
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
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Date</Text>
              </View>
              <View style={[styles.col, { width: "20%" }]}>
                <Text style={{ textAlign: "right" }}>Product</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Orig. Amount</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Discount</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Amount Due</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Amount Applied</Text>
              </View>
            </View>
            <View>{JSON.stringify(payment)}</View>

            {payment?.inventory_purchasepaymentrelation?.map(
              (relation: any, index: number) => (
                <View key={index} style={styles.row}>
                  <View style={[styles.col, { width: "5%" }]}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {new Date(
                        relation.purchase.created_date
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "20%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {relation.purchase.product?.name || "-"}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {(
                        relation.purchase.unit_price *
                        relation.purchase.quantity
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {relation.purchase.discount || 0}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {relation.purchase.balance.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.col, { width: "15%" }]}>
                    <Text style={{ textAlign: "right" }}>
                      {relation.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )
            )}

            <View style={styles.row}>
              <View style={[styles.col, { width: "85%" }]}>
                <Text
                  style={{ fontSize: 8, fontWeight: 700, textAlign: "right" }}
                >
                  Total
                </Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}></Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text>Payment Voucher</Text>
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
