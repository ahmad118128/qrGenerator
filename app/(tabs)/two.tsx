import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  PermissionsAndroid,
  Button,
  TouchableOpacity,
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<ExcelItem>({});
  const [newItem, setNewItem] = useState<string>("");
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);
  const [xlsxData, setXlsxData] = useState<any[]>([]); // Change the type as per your data structure

  const [pickedFile, setPickedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
  //     console.log({ status });

  //     if (status === "granted") {
  //       setPermissionsGranted(true);
  //     } else {
  //       console.log("Media library permission not granted");
  //     }
  //   })();
  // }, []);
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

  const parseXLSX = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("Parsed data:", parsedData);
          setXlsxData(parsedData);
        }
      };
      reader.readAsBinaryString(blob);
    } catch (error) {
      console.error("XLSX parsing error:", error);
    }
  };
  const readExcelFile = async (uri: string) => {
    try {
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at ${uri}`);
      }
      console.log({ fileInfo });

      const fileContent = await FileSystem.readAsStringAsync(uri);
      const workbook = XLSX.read(fileContent, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      console.log("Excel file data:", data);
      console.log(JSON.stringify(data));
    } catch (error) {
      console.error("Error reading Excel file:", error);
    }
  };
  //     console.log("File downloaded to:", uri);
  //     setDownloadedUri(uri);
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     setDownloadedUri(null);
  //   }
  // };

  // const renderWebView = () => {
  //   if (downloadedUri) {
  //     return <WebView source={{ uri: downloadedUri }} />;
  //   } else {
  //     return <Text>No file to display</Text>;
  //   }
  // };
  // useEffect(() => {
  //   // const downloadPdfToFileSystem = async (
  //   //   base64: string | number[],
  //   //   fileId: any
  //   // ) => {
  //   //   const IS_IOS = Platform.OS === "ios";
  //   //   const {
  //   //     dirs: { DownloadDir, DocumentDir },
  //   //   } = ReactNativeBlobUtil.fs;
  //   //   const dirs = IS_IOS ? DocumentDir : DownloadDir;
  //   //   const path = `${dirs}/${fileId}.pdf`;
  //   //   try {
  //   //     if (!IS_IOS) {
  //   //       const systemVersion = DeviceInfo.getSystemVersion();
  //   //       const isDownloadAllowed = await PermissionsAndroid.request(
  //   //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  //   //       );
  //   //       if (
  //   //         systemVersion >= "11.0" ||
  //   //         isDownloadAllowed === PermissionsAndroid.RESULTS.GRANTED
  //   //       ) {
  //   //         await ReactNativeBlobUtil.fs.writeFile(path, base64, "base64");
  //   //       }
  //   //     }
  //   //   } catch (error) {
  //   //     console.error("Error loading downloaded files:", error);
  //   //   }
  //   // };
  //   // const loadDownloadedFiles = async () => {
  //   //   try {
  //   //     const downloadsDirectory = `${FileSystem.documentDirectory}Downloads/`;
  //   //     console.log("d", downloadsDirectory);
  //   //     // const path = `${RNFS.ExternalStorageDirectoryPath}/Download/Sample.xlsx`;
  //   //     console.log("ppp", { DownloadDirectoryPath });
  //   //     // const files = await FileSystem.readDirectoryAsync(downloadsDirectory);
  //   //     // setDownloadedFiles(files);
  //   //   } catch (error) {
  //   //     console.error("Error loading downloaded files:", error);
  //   //   }
  //   // };
  //   // loadDownloadedFiles();
  // }, []);

  // useEffect(() => {
  //   const loadFile = async () => {
  //     try {
  //       const fileInfo = await FileSystem.getInfoAsync(
  //         "file:///path/to/your/file"
  //       ); // Replace with the path to your file
  //       if (fileInfo.exists) {
  //         const content = await FileSystem.readAsStringAsync(
  //           "file:///path/to/your/file"
  //         );
  //         Alert.alert(content);

  //         // setFileContent(content);
  //       } else {
  //         console.log("File not found");
  //       }
  //     } catch (error) {
  //       Alert.alert("Error loading file:");

  //       console.error("Error loading file:", error);
  //     }
  //   };

  //   loadFile();
  //   // const loadFile = async () => {
  //   //   try {
  //   //     const directoryPath = RNFS.DocumentDirectoryPath; // Or any other directory where your file is located
  //   //     const files = await RNFS.readDir(directoryPath);
  //   //     // Assuming your file name is 'example.txt', you can filter the files array to find your file
  //   //     const file = files.find((file) => file.name === "example.txt");
  //   //     if (file) {
  //   //       const fileContent = await RNFS.readFile(file.path, "utf8");
  //   //       Alert.alert(fileContent);
  //   //     } else {
  //   //       console.log("File not found");
  //   //     }
  //   //   } catch (error) {
  //   //     console.error("Error loading file:", error);
  //   //   }
  //   // };

  //   // loadFile();

  //   const loadExcelFile = async () => {
  //     try {
  //       // const filePath = `${REFS.DocumentDirectoryPath}/your_excel_file.xlsx`;
  //       // const fileExists = await REFS.exists(filePath);

  //       // if (!fileExists) {
  //       //   Alert.alert("File Not Found", "The Excel file does not exist.");
  //       //   return;
  //       // }

  //       // const fileContent = await RNFS.readFile(filePath, "base64");
  //       // const workbook = XLSX.read(fileContent, { type: "base64" });
  //       // const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
  //       // const sheet = workbook.Sheets[sheetName];
  //       // const jsonData = XLSX.utils.sheet_to_json(sheet, {
  //       //   header: 1,
  //       // }) as string[][];
  //       // const headers = jsonData[0];
  //       // const dataList = jsonData.slice(1).map((row: string[]) => {
  //       //   const rowData: ExcelItem = {};
  //       //   row.forEach((cell, index) => {
  //       //     rowData[headers[index]] = cell;
  //       //   });
  //       //   return rowData;
  //       // });
  //       setDataList(dataList);
  //     } catch (error) {
  //       console.error("Error loading Excel file:", error);
  //     }
  //   };

  //   loadExcelFile();
  // }, []);
  // console.log({ pickedFile });

  const handleDelete = (index: number) => {
    const newData = [...dataList];
    newData.splice(index, 1);
    setDataList(newData);
  };

  const handleAdd = () => {
    // Add your implementation for adding a new row
    const newRow: ExcelItem = {}; // Create a new row with empty values or default values
    setDataList([...dataList, newRow]);
  };

  const handleEdit = (rowIndex: number, value: string) => {
    console.log({ value });

    // Add your implementation for editing a cell in the table
    // const newData = [...dataList];
    // newData[rowIndex][columnIndex] = value;
    // setDataList(newData);
  };

  console.log({ dataList });

  return (
    <View style={styles.container}>
      <View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Button title="Browse File" onPress={browseFile} />
          {pickedFile !== null && <Text>Picked File: </Text>}
        </View>

        <FlatList
          data={dataList}
          renderItem={({ item }) => <Text>{item}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />

        <TouchableOpacity onPress={handleAdd}>
          <Text>Add New Row</Text>
        </TouchableOpacity>
        {/* <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
          <Row
            data={dataList[0]}
            style={{ height: 40, backgroundColor: "#f1f8ff" }}
            textStyle={{ margin: 6 }}
          />
          {dataList.map((rowData, index) => (
            <Row
              key={index}
              data={rowData}
              style={{ height: 40 }}
              textStyle={{ margin: 6 }}

              // onPress={() => handleEdit(index, rowData)}
            />
          ))}
        </Table> */}
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
});
