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
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface ExcelItem {
  [key: string]: string;
}

const alertConfirm = (onPressOk: () => void) =>
  Alert.alert(
    "تایید",
    "آیا از این کار اطمینان دارید؟",
    [
      {
        text: "بله",
        onPress: onPressOk,
      },
      {
        text: "خیر",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );

export default function TabOneScreen() {
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [dataList2, setDataList2] = useState<ExcelItem[] | any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");

  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null);

  // const [pickedFile, setPickedFile] =
  //   useState<DocumentPicker.DocumentPickerResult | null>(null);

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
      <View style={styles.item}>
        <Text style={[styles.table, { width: "10%" }]}>{index + 1}-</Text>
        <Text style={[styles.table, { width: "50%" }]}>
          {item.toString().substring(0, 20)}
        </Text>
        {/* <QRCode value={item.toString()} size={50} /> */}
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
          {index}- {item.name.substring(0, 20)}
        </Text>
        <QRCode value={item.toString()} size={25} />
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

  const exportToXLSX = async () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: "Bill Clinton", index: 42 },
      { name: "GeorgeW Bush", index: 43 },
      { name: "Barack Obama", index: 44 },
      { name: "Donald Trump", index: 45 },
      { name: "Joseph Biden", index: 46 },
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

    try {
      // خواندن داده‌های فایل از URI
      const base64Data = uri.split(",")[1];
      const bufferData = Buffer.from(base64Data, "binary").toString("base64");

      // ذخیره داده‌های فایل در حافظه گوشی
      const path = `${FileSystem.documentDirectory}${fileName}`;

      // Save the file to the Download directory
      // const downloadDir = FileSystem.documentDirectory + "Download/";
      // const path = `${downloadDir}${fileName}`;

      // Save the file to the cache directory
      // const cacheDir = FileSystem.cacheDirectory;
      // const path = `${cacheDir}${fileName}`;

      // const to = FileSystem.documentDirectory + fileName;

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
        // const fileInfo = await FileSystem.getInfoAsync(path);
        // if (fileInfo.exists) {
        //   console.log("File exists.");
        // } else {
        //   console.log("File does not exist.");
        // }

        FileSystem.readAsStringAsync(path, { encoding: "base64" }).then(
          (data) => {
            const workbook = XLSX.read(data, { type: "base64" });
            const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
            const worksheet = workbook.Sheets[sheetName];
            const parsedData: ExcelItem[] = XLSX.utils.sheet_to_json(worksheet);
            console.log({ parsedData });

            setDataList2(parsedData);
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
      {dataList2.length === 0 && (
        <View
          style={[
            styles.rowCenter,
            {
              justifyContent: "space-between",
              borderWidth: 1,
              borderBlockColor: "gray",
              paddingHorizontal: 5,
            },
          ]}
        >
          <TextInput
            value={textInputValue}
            onChangeText={setTextInputValue}
            placeholder="Enter new item"
            style={{ width: "80%" }}
          />
          <Button
            title={updatedIndex !== null ? "Edit" : "Add"}
            onPress={handlePressButton}
          />
        </View>
      )}

      {dataList.length === 0 ? (
        <View>
          <Button title="اضافه کردن لیست" onPress={browseFile} />
          <HelperAdd />
        </View>
      ) : dataList2.length === 0 ? (
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={[styles.rowCenter, { justifyContent: "space-between" }]}>
            <Button
              title="لیست جدید "
              onPress={() =>
                alertConfirm(() => {
                  setDataList([]);
                })
              }
            />
            <Text> تعداد: {dataList.length}</Text>
          </View>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              paddingHorizontal: 10,
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

          <Button
            title="تایید نهایی و ساخت بار کد"
            onPress={() => alertConfirm(exportToXLSX)}
          />
        </View>
      ) : (
        <View style={{ flex: 1, padding: 5 }}>
          <View style={[styles.rowCenter, { justifyContent: "space-between" }]}>
            <Button
              title="remove list"
              onPress={() =>
                alertConfirm(() => {
                  setDataList2([]);
                })
              }
            />
            <Text> تعداد: {dataList.length}</Text>
          </View>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              paddingHorizontal: 10,
            }}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredData2}
            renderItem={renderQrItem}
            keyExtractor={(item, index) => index.toString()}
          />

          {/* <Button
            title="save file"
            // onPress={() => alertConfirm(exportToXLSX)}
          /> */}
        </View>
      )}
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
  rowCenter: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "center",
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
});

const HelperAdd = () => {
  return (
    <View style={{ paddingHorizontal: 2 }}>
      <Text
        style={{
          marginVertical: 10,
          // width: "90%",
          direction: "rtl",
          textAlign: "right",
          writingDirection: "rtl",
        }}
      >
        توجه داشته باشید فرمت فایل xlsx و طبق مثال زیر اطلاعات صحیح وارد شود.
      </Text>

      <View style={styles.rowCenter}>
        <View style={{ width: 25 }} />
        <View style={styles.rowCenter}>
          <Text style={styles.table}>name</Text>
          <Text style={styles.table}> </Text>
        </View>
      </View>
      <View style={styles.rowCenter}>
        <FontAwesome
          name="check-circle"
          size={25}
          color="green"
          style={{ marginHorizontal: 2 }}
        />
        <View style={styles.rowCenter}>
          <Text style={styles.table}>احمد صفری</Text>
          <Text style={styles.table}> </Text>
        </View>
      </View>
      <View style={[styles.rowCenter, { marginTop: 20 }]}>
        <View style={{ width: 25 }} />
        <View style={styles.rowCenter}>
          <Text style={styles.table}>name</Text>
          <Text style={styles.table}>family</Text>
          <Text style={styles.table}>phone</Text>
        </View>
      </View>
      <View style={styles.rowCenter}>
        <FontAwesome
          name="close"
          size={25}
          color="red"
          style={{ marginHorizontal: 2 }}
        />
        <View style={styles.rowCenter}>
          <Text style={styles.table}>احمد</Text>
          <Text style={styles.table}>صفری</Text>
          <Text style={styles.table}>09376688343</Text>
        </View>
      </View>
    </View>
  );
};
