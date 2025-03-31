import React from "react";
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
  page: { backgroundColor: "white" },
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: "Nunito Sans",
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

export default function DeliveryNote({ order_number, items, customer }: any) {
  return (
    <Document
      title={`Delivery Note ${order_number}`}
      author="Kilimolink"
      subject={`Delivery Note ${order_number}`}
    >
      <Page size="A4" style={styles.body} wrap>
        <View>
          <View style={styles.pageHeader}>
            <View>
              <Image
                src="/img/logo/logo-primary-by-lolkirr.png"
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
                  <Text style={{ fontSize: 14, paddingBottom: 3 }}>
                    DELIVERY NOTE
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text style={{ fontSize: 8, paddingBottom: 3 }}>
                    {`# DN${order_number}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.pageHeader}>
            <View style={{ marginBottom: 10, flex: 1 }}>
              <Text style={{ paddingVertical: 3, fontWeight: 700 }}>
                Delivered To
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
              {items[0]?.order_id?.po_number && (
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
              <View style={[styles.col, { width: "2%" }]}>
                <Text>#</Text>
              </View>
              <View style={[styles.col, { width: "38%" }]}>
                <Text>Item &amp; Description</Text>
              </View>
              <View style={[styles.col, { width: "15%" }]}>
                <Text>Qty</Text>
              </View>
            </View>
            {items.map((item: any, index: any) => (
              <View style={styles.row} key={item?.id || index}>
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
              </View>
            ))}
          </View>
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 8, color: "#374151" }}>
              NOTE: Please sign and stamp this delivery note after confirmation
            </Text>
          </View>
          <View style={{ paddingTop: 15 }}>
            <Text style={{ fontSize: 8, color: "#374151" }}>
              Please share feedback about this delivery
            </Text>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text>{`# DN${order_number}`}</Text>
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
