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

import _ from "lodash";

import { NativeModules } from "react-native";
// const SavePath =
//   Platform.OS === "ios"
//     ? RNFS.DocumentDirectoryPath
//     : RNFS.ExternalDirectoryPath;
// const sampleDocFilePath = SavePath + "/sample.doc";
// const DownloadDirectoryManager = NativeModules.DownloadDirectoryManager;
import React, { useEffect, useState } from "react";

interface ExcelItem {
  [key: string]: string;
}

export default function TabTwoScreen() {
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null);

  const [pickedFile, setPickedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);

  const [textInputValue, setTextInputValue] = useState<string>("");

  const qrCodeData = "Your data here"; // Data to encode into the QR code

  const renderItem = ({ item, index }: { item: ExcelItem; index: number }) => {
    return (
      <View style={styles.item}>
        <Text>
          {index}- {item.toString().substring(0, 20)}
        </Text>

        <Button title="Edit" onPress={() => handleActiveEdit(index)} />
        <Button title="Delete" onPress={() => handleDelete(index, item)} />
      </View>
    );
  };

  const browseFile = async () => {
    // File picked: {"assets": [{"mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "name": "Sample.xlsx", "size": 83418, "uri": "file:///Users/ahmadsafari/Library/Developer/CoreSimulator/Devices/61A0D180-8C67-483B-B373-562AACED7B51/data/Containers/Data/Application/CBB43BBE-31CE-4AB9-8721-042785DCC0AC/Library/Caches/ExponentExperienceData/@anonymous/expoQR-33d02680-1a4a-4151-be2d-f52cdea42cf7/DocumentPicker/1172FBC1-9D0D-46CB-B4AD-816594337306.xlsx"}], "canceled": false}
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result !== null) {
        const fileUri = result?.assets[0].uri;

        setPickedFile(result);
        // await readExcelFile(fileUri);

        const file = FileSystem.readAsStringAsync(fileUri, "base64");
        console.log({ file });

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

              setDataList(parsedData);

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
    newData.splice(index, 1);
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

  return (
    <View style={styles.container}>
      <View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <QRCode value={qrCodeData} size={200} />

          <Button title="Browse File" onPress={browseFile} />
          {pickedFile !== null && <Text>Picked File: </Text>}
        </View>
        <FlatList
          data={dataList}
          renderItem={renderItem}
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
  },
});
