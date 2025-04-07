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

export default function PaymentVoucherPDF() {
  let rowCount: number = 0;

  return (
    <Document
      title={`Payment Voucher`}
      keywords="Kilimolink, Payment Voucher"
      description="Payment Voucher"
      creator="Kilimolink"
      producer="Kilimolink"
      title="Payment Voucher"
      subject="Payment Voucher"
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
              <View style={[styles.col, { width: "35%" }]}>
                <Text>Date</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Product</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Orig. Amount</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Amount Due</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text style={{ textAlign: "right" }}>Amount Applied</Text>
              </View>
            </View>

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
