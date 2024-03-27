import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  PermissionsAndroid,
  Button,
  TouchableOpacity,
  TextInput,
} from "react-native";
import XLSX from "xlsx";
import { DocumentDirectoryPath, DownloadDirectoryPath } from "react-native-fs";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import RNFetchBlob from "rn-fetch-blob";
import * as FileSystem from "expo-file-system";
import DeviceInfo from "react-native-device-info";
import ReactNativeBlobUtil from "react-native-blob-util";
import FileViewer from "react-native-file-viewer";
import { WebView } from "react-native-webview";
import * as DocumentPicker from "expo-document-picker";
import * as Permissions from "expo-permissions";
import { Table, Row } from "react-native-table-component";
import QRCode from "react-native-qrcode-svg";
import Base from "base64-js";
import { Buffer } from "buffer";
import { CameraView, useCameraPermissions } from "expo-camera/next";

// Convert data URI to binary data

import _ from "lodash";

import { NativeModules } from "react-native";

// const sampleDocFilePath = SavePath + "/sample.doc";
// const DownloadDirectoryManager = NativeModules.DownloadDirectoryManager;
import React, { useEffect, useState } from "react";

interface ExcelItem {
  [key: string]: string;
}
function dataUriToBinary(dataUri: string): ArrayBuffer {
  // Parse the data URI
  const match = dataUri.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid data URI format");
  }

  const mimeType = match[1];
  const base64Data = match[2];

  // Decode the base64 data
  const binaryStr = Buffer.from(base64Data, "base64").toString("binary");

  // Convert binary string to ArrayBuffer
  const buffer = new ArrayBuffer(binaryStr.length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < binaryStr.length; i++) {
    bufferView[i] = binaryStr.charCodeAt(i);
  }

  return buffer;
}
const exportToXLSX = (dataList: any[]) => {
  const ws = XLSX.utils.json_to_sheet(dataList);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

  const uri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
  return uri;
};

const atob = (input: any) => {
  return Buffer.from(input, "base64").toString("binary");
};

export default function TabTwoScreen() {
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [dataList2, setDataList2] = useState<ExcelItem[] | any[]>([]);

  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null);

  const [pickedFile, setPickedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);

  const [textInputValue, setTextInputValue] = useState<string>("");

  const qrCodeData = "Your data here"; // Data to encode into the QR code

  const renderCrudItem = ({
    item,
    index,
  }: {
    item: ExcelItem;
    index: number;
  }) => {
    return (
      <View style={styles.item}>
        <Text>
          {index}- {item.toString().substring(0, 20)}
        </Text>
        <QRCode value={item.toString()} size={50} />
        <Button title="Edit" onPress={() => handleActiveEdit(index)} />
        <Button title="Delete" onPress={() => handleDelete(index, item)} />
      </View>
    );
  };
  const renderQrItem = ({
    item,
    index,
  }: {
    item: ExcelItem;
    index: number;
  }) => {
    return (
      <View style={styles.item}>
        <Text>
          {index}- {item.toString().substring(0, 20)}
        </Text>
        <QRCode value={item.toString()} size={100} />
      </View>
    );
  };

  const browseFile = async () => {
    // File picked: {"assets": [{"mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "name": "Sample.xlsx", "size": 83418, "uri": "file:///Users/ahmadsafari/Library/Developer/CoreSimulator/Devices/61A0D180-8C67-483B-B373-562AACED7B51/data/Containers/Data/Application/CBB43BBE-31CE-4AB9-8721-042785DCC0AC/Library/Caches/ExponentExperienceData/@anonymous/expoQR-33d02680-1a4a-4151-be2d-f52cdea42cf7/DocumentPicker/1172FBC1-9D0D-46CB-B4AD-816594337306.xlsx"}], "canceled": false}
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result !== null) {
        let fileUri = result?.assets[0].uri;
        console.log("Brows", fileUri);

        setPickedFile(result);
        // await readExcelFile(fileUri);

        // const file = FileSystem.readAsStringAsync(fileUri, "base64");
        if (Platform.OS === "android") {
          // change the file:// to content:// uri
          FileSystem.getContentUriAsync(fileUri).then((uri) => {
            fileUri = uri;
          });
        }

        FileSystem.readAsStringAsync(fileUri, { encoding: "base64" }).then(
          (data) => {
            const workbook = XLSX.read(data, { type: "base64" });
            const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
            const worksheet = workbook.Sheets[sheetName];
            const parsedData: ExcelItem[] = XLSX.utils.sheet_to_json(
              worksheet,
              {
                header: 1,
              }
            );

            setDataList([...dataList, ...parsedData]);

            // console.log({ data });
          }
        );

        // now it works
        // handle file
        // parseXLSX(result.assets[0].uri);
      } else {
        console.log("File pick cancelled");
      }
    } catch (error) {
      console.error("File pick error:", error);
    }
  };
  const exportQrCodeList = async () => {
    // File picked: {"assets": [{"mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "name": "Sample.xlsx", "size": 83418, "uri": "file:///Users/ahmadsafari/Library/Developer/CoreSimulator/Devices/61A0D180-8C67-483B-B373-562AACED7B51/data/Containers/Data/Application/CBB43BBE-31CE-4AB9-8721-042785DCC0AC/Library/Caches/ExponentExperienceData/@anonymous/expoQR-33d02680-1a4a-4151-be2d-f52cdea42cf7/DocumentPicker/1172FBC1-9D0D-46CB-B4AD-816594337306.xlsx"}], "canceled": false}
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result !== null) {
        const fileUri = result?.assets[0].uri;

        setPickedFile(result);
        // await readExcelFile(fileUri);

        const file = FileSystem.readAsStringAsync(fileUri, "base64");
        if (Platform.OS === "android") {
          // change the file:// to content:// uri
          // FileSystem.getContentUriAsync(fileUri).then((uri) => {});
        } else {
          FileSystem.readAsStringAsync(fileUri, { encoding: "base64" }).then(
            (data) => {
              const workbook = XLSX.read(data, { type: "base64" });
              const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
              const worksheet = workbook.Sheets[sheetName];
              const parsedData: ExcelItem[] = XLSX.utils.sheet_to_json(
                worksheet,
                {
                  header: 1,
                }
              );

              setDataList([...dataList, ...parsedData]);

              // console.log({ data });
            }
          );
        }

        // now it works
        // handle file
        // parseXLSX(result.assets[0].uri);
      } else {
        console.log("File pick cancelled");
      }
    } catch (error) {
      console.error("File pick error:", error);
    }
  };

  const handleActiveEdit = (index: number) => {
    setUpdatedIndex(index);
    setTextInputValue(dataList[index].toString());
  };

  const handleDelete = (index: number, item: ExcelItem) => {
    const newData = [...dataList];
    [...dataList].splice(index, 1);
    setDataList(newData);
    // setDataList(dataList.filter((data) => data !== item));
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
    }
  };

  const saveXLSXFile = async (dataURI: string) => {
    try {
      // Convert data URI to binary data

      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const byteArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }

      // Create Blob from binary data
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create file path where you want to save the XLSX file
      const filePath = FileSystem.documentDirectory + "example.xlsx";

      try {
        // Write the file to the device's storage
        // await FileSystem.writeAsStringAsync(filePath, byteArray, {
        //   encoding: FileSystem.EncodingType.Base64,
        // });
        // // Return the file URI
        // console.log({ fileUri });
      } catch (error) {
        console.error("Error saving file:", error);
        return null;
      }

      // // Write the Blob to the file system
      // await FileSystem.writeAsStringAsync(filePath, blob, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });

      // // If you want to check the saved file's details, you can use FileSystem.getInfoAsync
      // const fileInfo = await FileSystem.getInfoAsync(filePath);
      // console.log("File saved successfully:", fileInfo);

      // Now you have saved the XLSX file in storage
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const exportToXLSX = async () => {
    const ws = XLSX.utils.json_to_sheet([
      { Name: "Bill Clinton", Index: 42 },
      { Name: "GeorgeW Bush", Index: 43 },
      { Name: "Barack Obama", Index: 44 },
      { Name: "Donald Trump", Index: 45 },
      { Name: "Joseph Biden", Index: 46 },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const fileName = "example.xlsx"; // نام فایل
    const uri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    const destPath = FileSystem?.documentDirectory as string;
    const savedFilePath = destPath + fileName;

    /* create workbook and append worksheet */
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    /* export to XLSX */
    await XLSX.writeFileXLSX(wb, "SheetJSReactAoO.xlsx");

    try {
      const props = await FileSystem.getInfoAsync(destPath);
      if (!props.exists) {
        await FileSystem.makeDirectoryAsync(destPath, { intermediates: true });
      }

      console.log({ props });
    } catch (e) {
      console.log({ e });
    }

    try {
      // خواندن داده‌های فایل از URI
      const base64Data = uri.split(",")[1];
      const bufferData = Buffer.from(base64Data, "binary").toString("base64");

      // ذخیره داده‌های فایل در حافظه گوشی
      const path = `${FileSystem.documentDirectory}${fileName}`;

      // Save the file to the Download directory
      const downloadDir = FileSystem.documentDirectory + "Download/";
      // const path = `${downloadDir}${fileName}`;

      // Save the file to the cache directory
      const cacheDir = FileSystem.cacheDirectory;
      // const path = `${cacheDir}${fileName}`;

      const to = FileSystem.documentDirectory + fileName;

      // await FileSystem.copyAsync({
      //   from: uri, // uri to the image file
      //   to,
      // })
      //   .then((response) => console.log({ response }))
      //   .catch((error) => console.log({ error }));

      await FileSystem.writeAsStringAsync(path, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      })
        .then((response) => console.log("save correct"))
        .catch((error) => console.log({ error }));

      try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists) {
          console.log("File exists.");
        } else {
          console.log("File does not exist.");
        }

        FileSystem.readAsStringAsync(path, { encoding: "base64" }).then(
          (data) => {
            const workbook = XLSX.read(data, { type: "base64" });
            const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
            const worksheet = workbook.Sheets[sheetName];
            const parsedData: ExcelItem[] = XLSX.utils.sheet_to_json(
              worksheet,
              {
                header: 1,
              }
            );

            setDataList2([...dataList, ...parsedData]);
          }
        );
      } catch (error) {
        console.error("Error occurred while checking file existence:", error);
      }

      // // Read the file
      // const fileContents = await FileSystem.readAsStringAsync(path);

      // // Decode the Base64 data
      // const decodedData = Buffer.from(fileContents, "base64");

      // // Convert decoded data to string or whatever format it was before saving
      // const originalData = decodedData.toString();

      // console.log("originalData", originalData);

      // console.log(`save successful   ${fileName} ${path}.`);
    } catch (error) {
      console.error("Error on save:", { error });
    }

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
  return (
    <View style={styles.container}>
      <View>
        <Button title="Browse File" onPress={browseFile} />
        <Button title="save qr code list" onPress={exportToXLSX} />

        {pickedFile !== null && <Text>Picked File: </Text>}
        <Text>length: {dataList.length}</Text>

        <FlatList
          data={dataList}
          renderItem={renderQrItem}
          keyExtractor={(item, index) => index.toString()}
        />
        <Text>length: {dataList2.length}</Text>

        <FlatList
          data={dataList2}
          renderItem={renderQrItem}
          keyExtractor={(item, index) => index.toString()}
        />
        <TextInput
          value={textInputValue}
          onChangeText={setTextInputValue}
          placeholder="Enter new item"
        />
        <Button
          title={updatedIndex !== null ? "Edit" : "Add"}
          onPress={handlePressButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  item: {
    width: "100%",
    display: "flex",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderBottomColor: "red",
    borderBottomWidth: 1,
    flexWrap: "wrap",
    paddingVertical: 10,
  },
});
