import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
} from "react-native";
import XLSX from "xlsx";
import { Text, View } from "@/components/Themed";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import QRCode from "react-native-qrcode-svg";
import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ExcelItem, IFinalDataList, IFinalDataListBase64 } from "../types";
import { FINAL_LIST_NAME } from "../constants";
import { alertConfirm, generateUniqueId } from "../utils";
import { CustomButton } from "@/components/CustomButton";
import { CustomTextInput } from "@/components/CustomTextInput";
import { CustomSwitch } from "@/components/CustomSwitch";
import { CustomText } from "@/components/CustomText";

export default function TabOneScreen() {
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [dataList2, setDataList2] = useState<ExcelItem[] | any[]>([]);
  const [displayExportPrint, setDisplayExportPrint] = useState(false);
  const finalDataListBase64: IFinalDataListBase64[] = [];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null);
  const [isBrowseFile, setIsBrowseFile] = useState(false);

  const toggleSwitch = () => setIsBrowseFile((previousState) => !previousState);
  const [textInputValue, setTextInputValue] = useState<string>("");

  const filteredData = dataList.filter((item) =>
    item.toString().toLowerCase().includes(searchQuery2.toLowerCase())
  );
  const filteredData2 = dataList2.filter((item) =>
    item.name
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : dataList2
  );

  const renderCrudItem = ({
    item,
    index,
  }: {
    item: ExcelItem;
    index: number;
  }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderBottomColor: "gray",
          borderBottomWidth: 1,
          paddingVertical: 5,
        }}
      >
        <Text style={{ width: "50%" }}>
          {index + 1}- {item.toString().substring(0, 20)}
        </Text>
        <TouchableOpacity onPress={() => handleActiveEdit(index)}>
          <FontAwesome
            name="edit"
            size={25}
            color="gray"
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(index, item)}>
          <FontAwesome
            name="close"
            size={25}
            color="gray"
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderQrItem = ({
    item,
    index,
  }: {
    item: IFinalDataList;
    index: number;
  }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 3,
          borderBottomColor: "gray",
          borderBottomWidth: 1,
        }}
      >
        <Text>
          {index + 1}-{item.name.substring(0, 20)}
        </Text>
        <Text>{item.data}</Text>
        <Text>{item.status}</Text>
        <QRCode
          value={item.id}
          size={25}
          getRef={async (c) => {
            if (!c?.toDataURL) return;
            await c.toDataURL((data: string) => {
              if (!finalDataListBase64.find((i) => i.name === item.name)) {
                finalDataListBase64.push({
                  ...item,
                  qrcodeBase64: `data:image/jpeg;base64,${data}`,
                });
              }

              // console.log("data -------------------", data);

              // const shareImageBase64 = {
              //   title: "QR",
              //   message: "Here is my QR code!",
              //   url: `data:image/jpeg;base64,${data}`,
              // }
            });
          }}
        />
      </View>
    );
  };

  const browseFile = async () => {
    // File picked: {"assets": [{"mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "name": "Sample.xlsx", "size": 83418, "uri": "file:///Users/ahmadsafari/Library/Developer/CoreSimulator/Devices/61A0D180-8C67-483B-B373-562AACED7B51/data/Containers/Data/Application/CBB43BBE-31CE-4AB9-8721-042785DCC0AC/Library/Caches/ExponentExperienceData/@anonymous/expoQR-33d02680-1a4a-4151-be2d-f52cdea42cf7/DocumentPicker/1172FBC1-9D0D-46CB-B4AD-816594337306.xlsx"}], "canceled": false}
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result !== null) {
        let fileUri = Array.isArray(result?.assets) && result?.assets[0].uri;
        if (!fileUri) {
          return Alert.alert("error", "fileUri is undefined");
        }
        if (Platform.OS === "android") {
          // change the file:// to content:// uri
          FileSystem.getContentUriAsync(fileUri).then((uri) => {
            fileUri = uri;
          });
        }
        // const sheetName = wbb.SheetNames[0]; // Assuming only one sheet

        //   wbb.xlsx.readFile(fileUri).then(() => {

        //     const wsb = wbb.getWorksheet('My Sheet');
        //     const c1 = wsb?.getColumn(2);

        //     c1?.eachCell(c => {
        //        console.log(c.value);
        //     });

        //     const c2 = wsb?.getColumn(2);
        //     c2?.eachCell(c => {
        //        console.log(c.value);
        //     });

        //  }).catch(err => {
        //     console.log(err.message);
        //  });

        const data = await FileSystem.readAsStringAsync(fileUri, {
          encoding: "base64",
        }).then(async (data) => {
          // await workbook.xlsx.load(data);

          const workbook = XLSX.read(data, { type: "base64" });
          const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
          const worksheet = workbook.Sheets[sheetName];
          const parsedData: ExcelItem[] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

          setDataList([...dataList, ...parsedData]);

          // console.log({ data });
        });
        // await wbb.xlsx.load(data);

        // now it works
        // handle file
        // parseXLSX(result.assets[0].uri);
      } else {
        console.log("File pick cancelled");
      }
    } catch (error) {
      console.error("File pick error:", error);
    }

    // svgToBase64(qrCodeSvg, 100, 100)
    //   .then(async (base64ImageData) => {
    //     // Add image to Excel and save the file
    //     // const buffer = await addImageToExcel(base64ImageData);

    //     // // Convert buffer to base64 string
    //     // const base64String = buffer.toString();

    //     // Save the Excel file locally
    //     const fileUri = `${FileSystem.cacheDirectory}filename.xlsx`;
    //     await FileSystem.writeAsStringAsync(fileUri, base64ImageData, {
    //       encoding: FileSystem.EncodingType.Base64,
    //     });

    //     // Share the Excel file
    //     await Sharing.shareAsync(fileUri);
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error);
    //   });
  };

  const handleActiveEdit = (index: number) => {
    setUpdatedIndex(index);
    setTextInputValue(dataList[index].toString());
  };

  const handleDelete = (index: number, item: ExcelItem) => {
    // const newData = [...dataList];
    // [...dataList].splice(index, 1);
    // setDataList(newData);
    alertConfirm(() => setDataList(dataList.filter((data) => data !== item)));
  };

  const handlePressButton = () => {
    if (textInputValue.trim() !== "") {
      if (updatedIndex !== null) {
        const newData = [...dataList];
        newData[updatedIndex] = textInputValue;
        setDataList(newData);
      } else {
        setDataList([...dataList, textInputValue]);
      }
      setTextInputValue("");
      setUpdatedIndex(null);
    }
  };

  const saveFinalList = async () => {
    // convert string list to object list
    const objecDataList = dataList.map((item) => {
      return {
        id: generateUniqueId(),
        name: item.toString(),
        date: "",
        status: "",
      };
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(objecDataList);

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const uri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    const path = `${FileSystem?.documentDirectory}${FINAL_LIST_NAME}`;

    await FileSystem.writeAsStringAsync(path, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    })
      .then((response) => {
        Sharing.shareAsync(path);
        setDataList2(objecDataList);
      })
      .catch((error) => console.log({ error }));

    /* create workbook and append worksheet */
    // XLSX.utils.book_append_sheet(wb, ws, "Data");
    /* export to XLSX */
    // await XLSX.writeFileXLSX(wb, fileName);

    // try {
    //   const props = await FileSystem.getInfoAsync(destPath);
    //   if (!props.exists) {
    //     await FileSystem.makeDirectoryAsync(destPath, { intermediates: true });
    //   }

    //   console.log({ props });
    // } catch (e) {
    //   console.log({ e });
    // }

    // try {
    //   // خواندن داده‌های فایل از URI
    // const base64Data = uri.split(",")[1];
    //   const bufferData = Buffer.from(base64Data, "binary").toString("base64");

    //   // ذخیره داده‌های فایل در حافظه گوشی
    //   const path = `${FileSystem.documentDirectory}${fileName}`;

    //   // Save the file to the Download directory
    //   // const downloadDir = FileSystem.documentDirectory + "Download/";
    //   // const path = `${downloadDir}${fileName}`;

    //   // Save the file to the cache directory
    //   // const cacheDir = FileSystem.cacheDirectory;
    // const path = `${cacheDir}${fileName}`;

    //   // const to = FileSystem.documentDirectory + fileName;

    //   // await FileSystem.copyAsync({
    //   //   from: uri, // uri to the image file
    //   //   to,
    //   // })
    //   //   .then((response) => console.log({ response }))
    //   //   .catch((error) => console.log({ error }));

    // await FileSystem.writeAsStringAsync(savedFilePath, wbout, {
    //   encoding: FileSystem.EncodingType.Base64,
    // })
    //   .then((response) => {
    //     console.log("save correct :" + fileName);
    //     Sharing.shareAsync(savedFilePath);
    //   })
    //   .catch((error) => console.log({ error }));

    //   try {
    //     // const fileInfo = await FileSystem.getInfoAsync(path);
    //     // if (fileInfo.exists) {
    //     //   console.log("File exists.");
    //     // } else {
    //     //   console.log("File does not exist.");
    //     // }

    //     FileSystem.readAsStringAsync(path, { encoding: "base64" }).then(
    //       (data) => {
    //         const workbook = XLSX.read(data, { type: "base64" });
    //         const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
    //         const worksheet = workbook.Sheets[sheetName];
    //         const parsedData: ExcelItem[] = XLSX.utils.sheet_to_json(worksheet);
    //         console.log({ parsedData });

    //         setDataList2(parsedData);
    //       }
    //     );
    //   } catch (error) {
    //     console.error("Error occurred while checking file existence:", error);
    //   }

    //   // // Read the file
    //   // const fileContents = await FileSystem.readAsStringAsync(path);

    //   // // Decode the Base64 data
    //   // const decodedData = Buffer.from(fileContents, "base64");

    //   // // Convert decoded data to string or whatever format it was before saving
    //   // const originalData = decodedData.toString();

    //   // console.log("originalData", originalData);

    //   // console.log(`save successful   ${fileName} ${path}.`);
    // } catch (error) {
    //   console.error("Error on save:", { error });
    // }

    // console.log("ffff", FileSystem.documentDirectory);

    // RNFetchBlob.fs
    //   .writeFile(
    //     FileSystem.documentDirectory + "example.xlsx",
    //     XLSX.write(wb, { type: "binary", bookType: "xlsx" }),
    //     "ascii"
    //   )
    //   .then(() => console.log("File saved successfully"))
    //   .catch((err) => console.error("Error:", err));

    // const SavePath =
    //   Platform.OS === "ios"
    //     ? RNFS.DocumentDirectoryPath
    //     : RNFS.ExternalDirectoryPath;

    // // Save workbook to a file
    // XLSX.writeFileAsync("example.xlsx", wb, {
    //   type: "base64",
    //   bookType: "xlsx",
    // })
    //   .then(() => console.log("File created successfully"))
    //   .catch((err) => console.error("Error:", err));

    // saveXLSXFile(uri);

    // const ws = XLSX.utils.json_to_sheet(dataList);

    // Convert SVG images to PNG and include in dataList
    // for (let i = 0; i < dataList.length; i++) {
    //   const item = dataList[i];
    //   if (item.svgData) {
    //     const pngData = await convertSVGToPNG(item.svgData);
    //     item.imageData = pngData;
    //   }
    // }

    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    // try {
    //   // Generate a temporary file path
    //   const fileUri = `${FileSystem.cacheDirectory}exportedData.xlsx`;

    //   // Write the XLSX data to the file
    //   await FileSystem.writeAsStringAsync(fileUri, Buffer.from(wbout), {
    //     encoding: FileSystem.EncodingType.Base64,
    //   });

    //   return fileUri; // Return the file URI
    // } catch (error) {
    //   console.error('Error exporting to XLSX:', error);
    //   throw error; // Throw the error for handling elsewhere
    // }
  };

  const exportToPrint = async () => {
    try {
      const htmlContent = `<html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>print list</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
      </head>
      <body>
      
      <h2>Sample Table</h2>
      
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>qrcode</th>
          </tr>
        </thead>
        <tbody>
        ${finalDataListBase64
          .map(
            (item, index) => `
          <tr>
          <td>${index + 1}- ${item.name.substring(0, 20)}</td>
          <td><img src='${item.qrcodeBase64}' /></td>
        </tr>`
          )
          .join("")}
        </tbody>
      </table>
      
      </body>
      </html>
      `;
      // let htmlContent2 = `
      //   <html>
      //     <head>
      //       <style>
      //         body {
      //           font-family: 'Helvetica';
      //           font-size: 12px;
      //           display: flex;
      //           flex-wrap: wrap;
      //           justify-content: center;
      //           align-items: center;
      //           width: 1200px;
      //         }
      //         h1 {
      //           font-size: 5em;
      //         }
      //         .footers {
      //           margin-top: 50px;
      //         }
      //         img {
      //           width: 200px;
      //           height: 200px;
      //           border: 3px solid black;
      //           border-radius: 15px;
      //           padding: 20px;
      //         }
      //       </style>
      //     </head>
      //     <body>
      //       <table>`;

      // finalDataListBase64.forEach((item: IFinalDataListBase64) => {
      //   htmlContent += `
      //         <tr>
      //           <th><h6>List QR Code</h6></th>
      //         </tr>
      //         <th>
      //           ${item.name}
      //         </th>
      //         <tr>
      //           <th><p class='footers'><img src='${item.qrcodeBase64}' /></p></th>
      //         </tr>`;
      // });

      // htmlContent += `
      //       </table>
      //     </body>
      //   </html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error while printing:", error);
    }
  };

  const handleEndReached = () => {
    setDisplayExportPrint(true);
  };

  return (
    <View
      style={{
        width: "100%",
        padding: 10,
        flex: 1,
        backgroundColor: "white",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      {dataList2.length === 0 ? (
        <View
          style={{
            flex: 1,
            width: "100%",
          }}
        >
          <View>
            <CustomSwitch
              value={isBrowseFile}
              onValueChange={toggleSwitch}
              label="browse file"
            />

            {!isBrowseFile ? (
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "space-between", // To create equal space between the items
                  alignItems: "center",
                  height: 100,
                }}
              >
                <CustomTextInput
                  value={textInputValue}
                  onChangeText={setTextInputValue}
                  placeholder="Enter new item"
                />
                <CustomButton
                  title={updatedIndex !== null ? "Edit" : "Add"}
                  onPress={handlePressButton}
                />
              </View>
            ) : (
              <BrowseFile onPress={browseFile} />
            )}
          </View>
          <CustomTextInput
            style={{
              // height: 40,
              // borderColor: "gray",
              // borderWidth: 1,
              // paddingHorizontal: 10,
              marginBottom: 10,
            }}
            placeholder="Search..."
            value={searchQuery2}
            onChangeText={setSearchQuery2}
          />
          <FlatList
            data={filteredData}
            renderItem={renderCrudItem}
            keyExtractor={(item, index) => index.toString()}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CustomButton
              title="لیست جدید "
              onPress={() =>
                alertConfirm(() => {
                  setDataList([]);
                })
              }
            />
            <CustomButton
              title="تایید نهایی و ساخت بار کد"
              onPress={() => alertConfirm(saveFinalList)}
            />
            <Text> تعداد: {dataList.length}</Text>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 5 }}>
          <CustomTextInput
            style={{
              // height: 40,
              // borderColor: "gray",
              // borderWidth: 1,
              // paddingHorizontal: 10,
              marginBottom: 10,
            }}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredData2}
            renderItem={renderQrItem}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1}
          />

          {displayExportPrint && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <CustomButton
                title="remove list"
                onPress={() =>
                  alertConfirm(() => {
                    setDataList2([]);
                  })
                }
              />
              <CustomButton
                title="save file for Print"
                onPress={() => alertConfirm(exportToPrint)}
              />
              <Text> تعداد: {dataList2.length}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const BrowseFile = ({ onPress }: any) => {
  const [isShowHelp, setIsShowHelp] = useState(false);
  return (
    <View style={{ width: "100%", paddingHorizontal: 2 }}>
      <CustomButton title="اضافه کردن لیست" onPress={onPress} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => setIsShowHelp(!isShowHelp)}>
          <FontAwesome
            name="info"
            size={25}
            color="gray"
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
        <CustomText
          style={{
            marginVertical: 10,
            direction: "rtl",
            textAlign: "right",
            writingDirection: "rtl",
          }}
        >
          توجه داشته باشید فرمت فایل xlsx و طبق مثال زیر اطلاعات صحیح وارد شود.
        </CustomText>
      </View>
      {isShowHelp && (
        <View>
          <View style={helperStyles.row}>
            <Text style={helperStyles.header}>name</Text>
            <Text style={helperStyles.header}></Text>
            <FontAwesome
              name="check-circle"
              size={25}
              color="green"
              style={{ marginHorizontal: 2 }}
            />
          </View>

          <View style={helperStyles.row}>
            <Text style={helperStyles.cell}>احمد صفری</Text>
            <Text style={helperStyles.cell}></Text>
            <Text style={helperStyles.cell}></Text>
          </View>
          <View style={{ width: "100%", marginVertical: 20 }} />

          <View style={helperStyles.row}>
            <Text style={helperStyles.header}>name</Text>
            <Text style={helperStyles.header}>family</Text>
            <FontAwesome
              name="close"
              size={25}
              color="red"
              style={{ marginHorizontal: 2 }}
            />
          </View>
          <View style={helperStyles.row}>
            <Text style={helperStyles.cell}>احمد</Text>
            <Text style={helperStyles.cell}>صفری</Text>
            <Text style={helperStyles.cell}></Text>
          </View>
          <View style={helperStyles.row}>
            <Text style={helperStyles.cell}>احمد</Text>
            <Text style={helperStyles.cell}>صفری</Text>
            <Text style={helperStyles.cell}>9376688343</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 10,
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
  rowCenter: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    width: "30%",
    borderColor: "black",
    borderWidth: 1,
    padding: 3,
  },
  item: {
    width: "100%",
    display: "flex",
    flex: 1,
    flexDirection: "row",
    // justifyContent: "space-around",
    alignItems: "center",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    flexWrap: "wrap",
    // paddingVertical: 5,
  },
  input: {
    width: "50%",
  },
});

const helperStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
  },
  header: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  cell: {
    flex: 1,
    fontSize: 16,
  },
});
