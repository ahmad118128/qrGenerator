import EditScreenInfo from "@/components/EditScreenInfo";

import React, { useState, useEffect, useRef } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import {
  Alert,
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as htmlToPdf from "react-native-html-to-pdf";
import RNHTMLtoPDF from "react-native-html-to-pdf";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
// import QRCode from "qrcode";
const base64ImageData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=`;
import { Table, Row, Rows } from "react-native-table-component";
import QRCode from "react-native-qrcode-svg";
const { width } = Dimensions.get("window");
const qrSize = width * 0.7;

import { WebView } from "react-native-webview";
import * as Print from "expo-print";

const printPDF = async (htmlContent: any) => {
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    console.log(uri); // Output the file URI
    // You can now handle the PDF file URI, for example, you may want to open it or send it somewhere.
  } catch (error) {
    console.error("Error while printing:", error);
  }
};

const HTMLToPDF = ({ htmlContent }: any) => {
  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      scalesPageToFit={true}
      scrollEnabled={false}
      style={{ flex: 1 }}
    />
  );
};

const TabOneScreen_: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setScannedData(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.borderContainer}>
          <View style={[styles.border, { transform: [{ rotate: "45deg" }] }]} />
        </View>
      </Camera>
      {scanned && (
        <Button
          title="Tap to Scan Again"
          onPress={() => {
            setScanned(false);
            setScannedData("");
          }}
        />
      )}
      {scannedData !== "" && <Text>Scanned Data: {scannedData}</Text>}
    </View>
  );
};

function TabOneScreen__() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setScannedData(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles3.container}>
      {scanned && (
        <Button
          title="Tap to Scan Again"
          onPress={() => {
            setScanned(false);
            setScannedData("");
          }}
        />
      )}
      {scannedData !== "" && <Text>Scanned Data: {scannedData}</Text>}

      <CameraView
        style={styles3.camera}
        facing={facing}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View>
          <TouchableOpacity onPress={toggleCameraFacing}>
            <Text>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const TabOneScreen1: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setScannedData(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button
          title="Tap to Scan Again"
          onPress={() => {
            setScanned(false);
            setScannedData("");
          }}
        />
      )}
      {scannedData !== "" && <Text>Scanned Data: {scannedData}</Text>}
    </View>
  );
};

// export default TabOneScreen

// export default function TabOneScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Tab One test</Text>
//       <View
//         style={styles.separator}
//         lightColor="#eee"
//         darkColor="rgba(255,255,255,0.1)"
//       />
//       <EditScreenInfo path="app/(tabs)/index.tsx" />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  camera: {
    flex: 1,
  },
  borderContainer: {
    position: "absolute",
    width: qrSize,
    height: qrSize,
    justifyContent: "center",
    alignItems: "center",
  },
  border: {
    width: qrSize,
    height: 2,
    backgroundColor: "red",
  },
});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});

const styles3 = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
});

const htmlContent_ = `
<!DOCTYPE html>
<html>
<head>
  <title>My PDF</title>
</head>
<body>
  <h1>Hello, world!</h1>
  <p>This is a sample PDF generated from HTML.</p>
</body>
</html>
`;
const html = `<html>
      <head>
        <style>
          body {
            font-family: 'Helvetica';
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          h1 {
            font-size: 5em;
          }
          .footers {
            margin-top: 50px;
          }
          img {
            width: 500px; height: 500px;
            border: 3px solid black;
            border-radius: 15px;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th><h1>Scan QR</h1></th>
          </tr>
          <tr>
            <th><img src="data:image/png;base64, ${base64ImageData}"/></th>
          </tr>
          <tr>
            <th><p class='footers'>ini cuma test pdf</p></th>
          </tr>
        </table>
      </body>
    </html>`;

const generateAndSaveQRCode = async (dataList: any) => {
  try {
    const qrRefs = []; // Array to hold references

    for (let i = 0; i < dataList.length; i++) {
      const { name, family } = dataList[i];
      const qrData = JSON.stringify({ name, family });

      // Create a ref for each QRCode instance
      const qrRef = useRef();

      // Store the ref in the array
      qrRefs.push(qrRef);

      // Render the QRCode component and assign the ref
      <QRCode
        value={qrData}
        size={200}
        ref={qrRef}
        key={`${name}-${family}`}
      />;

      // Access the ref's current property to get the component instance
      // const svg = qrRef.current.toDataURL(); // Assuming toDataURL is a method of QRCode component
    }
    console.log({ qrRefs });

    return qrRefs;
  } catch (error) {
    console.error("Error generating or saving QR codes:", error);
  }
};

export default function TabOneScreen() {
  // useEffect(() => {
  //   // Example HTML content
  //   // Print the HTML content as PDF
  //   // printPDF(html);
  // }, []);

  const printPDF = async (htmlContent: string) => {
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log({ uri }); // Output the file URI
      await Sharing.shareAsync(uri);

      // You can now handle the PDF file URI, for example, you may want to open it or send it somewhere.
    } catch (error) {
      console.error("Error while printing:", error);
    }
  };

  const tableHead = ["Name", "Age", "Country", "QR Code"];
  const tableData = [
    ["John Doe", "30", "USA", ""],
    ["Jane Smith", "25", "Canada", ""],
    // More data...
  ];

  generateAndSaveQRCode([{ name: "ahmad", family: "ddd" }]);
  const [QRImage, setQRImage] = useState<any>("");
  const [imgBase64, setImgBase64] = useState();

  const qrCodesRefs = useRef([]);

  // const exportTableAsCSV = async () => {
  //   const qrCodesWithSVG = tableData.map((row) => {
  //     const qrCodeSVG = (
  //       <QRCode
  //         value={row[3]}
  //         size={30}
  //         backgroundColor="white"
  //         color="black"
  //       />
  //     );
  //     const qrCodeSVGString = qrCodeSVG.toDataURL();
  //     return [row[0], row[1], row[2], qrCodeSVGString];
  //   });

  //   const csvDataWithQR = qrCodesWithSVG.map((row) => row.join(",")).join("\n");

  //   const fileUri = FileSystem.documentDirectory + "table_data_with_qr.csv";
  //   await FileSystem.writeAsStringAsync(fileUri, csvDataWithQR, {
  //     encoding: FileSystem.EncodingType.UTF8,
  //   });
  //   // Notify user or perform any other action
  // };

  // const exportTableAsCSV = async () => {
  //   const qrCodeSvg = <QRCode value="Hello, World!" size={100} />;
  //   const csvData = tableData.map((row) => row.join(",")).join("\n");
  //   const fileUri = FileSystem.documentDirectory + "table_data.csv";
  //   await FileSystem.writeAsStringAsync(fileUri, csvData, {
  //     encoding: FileSystem.EncodingType.UTF8,
  //   })
  //     .then((response) => {
  //       console.log("save correct :" + fileUri);
  //       Sharing.shareAsync(fileUri);
  //     })
  //     .catch((error) => console.log({ error }));
  //   // Notify user or perform any other action
  // };

  // const exportTableAsCSV = async () => {
  //   const csvData = tableData.map((row) => row.join(",")).join("\n");

  //   // Convert QR code React components to SVG images
  //   const svgImages = await Promise.all(
  //     tableData.map(async (row) => {
  //       const qrCodeSvg = await QRCode.toSvg(row[3].props.value, { width: 30 });
  //       // const qrCodeSvg = <QRCode value="Hello, World!" size={100} />;

  //       return qrCodeSvg;
  //     })
  //   );

  //   // Construct table data with SVG images
  //   const tableDataWithSvg = tableData.map((row, index) => [
  //     ...row.slice(0, 3),
  //     svgImages[index],
  //   ]);

  //   const csvDataWithSvg = tableDataWithSvg
  //     .map((row) => row.join(","))
  //     .join("\n");
  //   const fileUri = FileSystem.documentDirectory + "table_data_with_qr.csv";
  //   await FileSystem.writeAsStringAsync(fileUri, csvDataWithSvg, {
  //     encoding: FileSystem.EncodingType.UTF8,
  //   });
  //   // Notify user or perform any other action
  // };
  // const exportTableAsCSV = async () => {
  //   try {
  //     // Convert tableData to CSV format
  //     const csvData = tableData.map((row) => row.join(",")).join("\n");

  //     // Create a file in the cache directory
  //     const fileUri = `${FileSystem.cacheDirectory}table_data.csv`;

  //     // Write the CSV data to the file
  //     await FileSystem.writeAsStringAsync(fileUri, csvData, {
  //       encoding: FileSystem.EncodingType.UTF8,
  //     });

  //     // Share the file
  //     await Sharing.shareAsync(fileUri, {
  //       mimeType: "text/csv",
  //       dialogTitle: "Share CSV File",
  //     });
  //   } catch (error) {
  //     console.error("Error exporting CSV:", error);
  //   }
  // };

  const exportTableAsCSV = async () => {
    const htmlContent = `
      <html>
        <body>
          <h1>Table Data</h1>
          <table border="1">
            ${tableData
              .map(
                (rowData) => `
              <tr>
                ${rowData.map((cellData) => `<td>${cellData}</td>`).join("")}
              </tr>
            `
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    try {
      const pdf = await htmlToPdf.convert({
        html: htmlContent,
        fileName: "table_data",
        base64: true,
      });
      const pdfUri = `data:application/pdf;base64,${pdf.base64}`;
      const destinationUri = `${FileSystem.documentDirectory}table_data.pdf`;
      if (pdf.base64) {
        await FileSystem.writeAsStringAsync(destinationUri, pdf.base64, {
          encoding: FileSystem.EncodingType.Base64,
        })
          .then((response) => {
            // console.log("save correct :" + fileUri);
            Sharing.shareAsync(destinationUri);
          })
          .catch((error) => console.log({ error }));
      }

      console.log("PDF saved at:", destinationUri);
    } catch (error) {
      console.error("Failed to create PDF:", error);
    }
  };

  const shareQR = async () => {
    QRImage.toDataURL((data: string) => {
      const shareImageBase64 = {
        title: "QR",
        message: "Here is my QR code!",
        url: `data:image/jpeg;base64,${data}`,
      };

      setQRImage(String(shareImageBase64.url));
    });

    // await Sharing.shareAsync(QRImage);
  };

  const generatePDF = async () => {
    let base;
    await QRImage.toDataURL(async (data: string) => {
      const shareImageBase64 = {
        title: "QR",
        message: "Here is my QR code!",
        url: `data:image/jpeg;base64,${data}`,
      };

      const html = `<html>
      <head>
        <style>
          body {
            font-family: 'Helvetica';
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          h1 {
            font-size: 5em;
          }
          .footers {
            margin-top: 50px;
          }
          img {
            width: 500px; height: 500px;
            border: 3px solid black;
            border-radius: 15px;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th><h1>Scan QR</h1></th>
          </tr>
          <th>
          <img src="${shareImageBase64.url}" /></th>

          <tr>
            <th><p class='footers'>ini cuma test pdf</p></th>
          </tr>
        </table>
      </body>
    </html>`;

      try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);

        // You can now handle the PDF file URI, for example, you may want to open it or send it somewhere.
      } catch (error) {
        console.error("Error while printing:", error);
      }
    });
  };
  // const qrCoded = new QRCode({
  //   size: 50,
  //   value: "vv",
  // });

  // const qrCode = <QRCode value={"ddd"} size={200} getRef={(ref) => ref} />;
  // const svg = qrCode.props.getRef;
  // svg();
  // console.log({ dd: () => svg });

  // const generatePDF = async () => {
  //   const dataList = [
  //     {
  //       name: "ahmad",
  //       qr: "qrCode",
  //     },
  //   ];

  //   try {
  //     let htmlContent = `
  //       <html>
  //         <head>
  //           <style>
  //             body {
  //               font-family: 'Helvetica';
  //               font-size: 12px;
  //               display: flex;
  //               flex-wrap: wrap;
  //               justify-content: center;
  //               align-items: center;
  //             }
  //             h1 {
  //               font-size: 5em;
  //             }
  //             .footers {
  //               margin-top: 50px;
  //             }
  //             img {
  //               width: 500px;
  //               height: 500px;
  //               border: 3px solid black;
  //               border-radius: 15px;
  //               padding: 20px;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <table>`;

  //     dataList.forEach((item: any) => {
  //       console.log({ item });

  //       htmlContent += `
  //             <tr>
  //               <th><h1>Scan QR</h1></th>
  //             </tr>
  //             <th>
  //               ${item.qr}
  //             </th>
  //             <tr>
  //               <th><p class='footers'><img src='${QRImage}' /></p></th>
  //             </tr>`;
  //     });

  //     htmlContent += `
  //           </table>
  //         </body>
  //       </html>`;

  //     const { uri } = await Print.printToFileAsync({ html: htmlContent });
  //     await Sharing.shareAsync(uri);
  //   } catch (error) {
  //     console.error("Error while printing:", error);
  //   }
  // };

  console.log({ QRImage: QRImage.to });

  return (
    <View>
      <View>
        <QRCode value={"test"} getRef={(ref) => setQRImage(ref)} size={20} />
      </View>

      <View>
        <Button title="generatePDF" onPress={generatePDF} />
      </View>

      <Table>
        <Row data={tableHead} />
        <Rows data={tableData} />
      </Table>
    </View>
  );
}
