import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import XLSX from "xlsx";
import { Text, View } from "@/components/Themed";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import QRCode from "react-native-qrcode-svg";
import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ExcelItem, IFinalDataList, IFinalDataListBase64 } from "../types";
import { FINAL_LIST_NAME } from "../constants";
import { alertConfirm, generateUniqueId, isExistFile } from "../utils";
import { CustomButton } from "@/components/CustomButton";
import { CustomTextInput } from "@/components/CustomTextInput";
import { CustomSwitch } from "@/components/CustomSwitch";
import { CustomText } from "@/components/CustomText";
import { TitleSection } from "@/components/TitleSection";
import { Collapsible } from "@/components/Collapsible";

export default function TabTwoScreen() {
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [dataList2, setDataList2] = useState<ExcelItem[] | any[]>([]);
  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null);
  const [isBrowseFile, setIsBrowseFile] = useState(false);
  const [isExistOldFile, setIsExistOldFile] = useState(false);
  const [textInputValue, setTextInputValue] = useState<string>("");

  useEffect(() => {
    (async () => {
      const existFile = await isExistFile(FINAL_LIST_NAME);
      if (existFile) {
        setIsExistOldFile(true);
      }
    })();
  });

  const toggleSwitch = () => setIsBrowseFile((previousState) => !previousState);

  const browseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result !== null) {
        let fileUri = Array.isArray(result?.assets) && result?.assets[0].uri;
        if (!fileUri) {
          return Alert.alert("یافت نشد");
        }
        if (Platform.OS === "android") {
          // change the file:// to content:// uri
          FileSystem.getContentUriAsync(fileUri).then((uri) => {
            fileUri = uri;
          });
        }

        await FileSystem.readAsStringAsync(fileUri, {
          encoding: "base64",
        }).then(async (data) => {
          const workbook = XLSX.read(data, { type: "base64" });
          const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

          const filteredList = parsedData.filter(
            (item: any) => item?.length > 0
          );

          setDataList([...dataList, ...filteredList]);
        });
      } else {
        console.log("File pick cancelled");
      }
    } catch (error) {
      console.error("File pick error:", error);
    }
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

  // const loadList = async () => {
  //   const path = `${FileSystem?.documentDirectory}${FINAL_LIST_NAME}`;

  //   try {
  //     const props = await FileSystem.getInfoAsync(path);

  //     if (!props.exists) {
  //       Alert.alert(`${FINAL_LIST_NAME}  ایجاد نشده است`);
  //       return;
  //     }

  //     FileSystem.readAsStringAsync(path, { encoding: "base64" }).then(
  //       (data) => {
  //         const workbook = XLSX.read(data, { type: "base64" });
  //         const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
  //         const worksheet = workbook.Sheets[sheetName];
  //         const parsedData = XLSX.utils.sheet_to_json(worksheet);
  //         setDataList(parsedData.map((item) => item?.name));
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error occurred while checking file existence:", error);
  //   }
  // };

  return (
    <View
      style={{
        width: "100%",
        padding: 20,
        flex: 1,
        backgroundColor: "white",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      {isExistOldFile && (
        <CustomText style={{ color: "#a62b2f" }}>
          شما قبلا لیست نهایی را ایجاد کرده اید. در صورت ادامه و ثبت مجدد qr کد
          های قبلی غیر قابل استفاده می شود.
        </CustomText>
      )}
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
              label="بارگزاری فایل از گوشی"
            />
            {!isBrowseFile ? (
              <CustomAddToList
                onPress={handlePressButton}
                updatedIndex={updatedIndex}
                textInputValue={textInputValue}
                setTextInputValue={setTextInputValue}
              />
            ) : (
              <BrowseFile onPress={browseFile} />
            )}
          </View>

          {dataList.length !== 0 && (
            <DataList
              dataList={dataList}
              setDataList={setDataList}
              setTextInputValue={setTextInputValue}
              setUpdatedIndex={setUpdatedIndex}
              setDataList2={setDataList2}
            />
          )}
        </View>
      ) : (
        <DataListQRcode dataList2={dataList2} setDataList2={setDataList2} />
      )}
    </View>
  );
}

const BrowseFile = ({ onPress }: any) => {
  return (
    <View style={{ width: "100%", paddingHorizontal: 2 }}>
      <CustomButton title="اضافه کردن لیست" onPress={onPress} />

      <Collapsible title={"راهنمای فایل"}>
        <View>
          <CustomText
            style={{
              marginVertical: 10,
              direction: "rtl",
              textAlign: "right",
              writingDirection: "rtl",
            }}
          >
            توجه داشته باشید فرمت فایل xlsx باشد و طبق مثال زیر اطلاعات با فرمت
            صحیح وارد شود.
          </CustomText>
          <View style={helperStyles.row}>
            <CustomText style={helperStyles.header}>name</CustomText>
            <Text style={helperStyles.header}></Text>
            <FontAwesome
              name="check-circle"
              size={25}
              color="green"
              style={{ marginHorizontal: 2 }}
            />
          </View>

          <View style={helperStyles.row}>
            <CustomText style={helperStyles.cell}>احمد صفری</CustomText>
            <Text style={helperStyles.cell}></Text>
            <Text style={helperStyles.cell}></Text>
          </View>
          <View style={{ width: "100%", marginVertical: 20 }} />

          <View style={helperStyles.row}>
            <CustomText style={helperStyles.header}>name</CustomText>
            <CustomText style={helperStyles.header}>family</CustomText>
            <FontAwesome
              name="close"
              size={25}
              color="red"
              style={{ marginHorizontal: 2 }}
            />
          </View>
          <View style={helperStyles.row}>
            <CustomText style={helperStyles.cell}>احمد</CustomText>
            <CustomText style={helperStyles.cell}>صفری</CustomText>
            <Text style={helperStyles.cell}></Text>
          </View>
          <View style={helperStyles.row}>
            <CustomText style={helperStyles.cell}>احمد</CustomText>
            <CustomText style={helperStyles.cell}>صفری</CustomText>
            <CustomText style={helperStyles.cell}>9376688343</CustomText>
          </View>
        </View>
      </Collapsible>
    </View>
  );
};
const CustomAddToList = ({
  onPress,
  updatedIndex,
  textInputValue,
  setTextInputValue,
}: any) => {
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between", // To create equal space between the items
        alignItems: "center",
        height: 100,
        marginTop: 15,
      }}
    >
      <CustomTextInput
        value={textInputValue}
        onChangeText={setTextInputValue}
        placeholder="نام را وارد نمایید"
      />
      <CustomButton
        fullWidth
        title={updatedIndex !== null ? "ویرایش" : "اضافه کن"}
        onPress={onPress}
      />
    </View>
  );
};

const DataList = ({
  dataList,
  setDataList,
  setTextInputValue,
  setUpdatedIndex,
  setDataList2,
}: any) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = dataList.filter((item: string) =>
    item.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomColor: "gray",
          borderBottomWidth: 1,
          paddingVertical: 7,
        }}
      >
        <View
          style={{
            width: "50%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Text>{index + 1}-</Text>
          <Text style={{ width: "50%" }}>
            {item.toString().substring(0, 20)}
          </Text>
        </View>
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

  const handleActiveEdit = (index: number) => {
    setUpdatedIndex(index);
    setTextInputValue(dataList[index].toString());
  };

  const handleDelete = (index: number, item: ExcelItem) => {
    alertConfirm(
      () => setDataList(dataList.filter((data: ExcelItem) => data !== item)),
      "حذف"
    );
  };

  const saveFinalList = async () => {
    // convert string list to object list
    const objecDataList = dataList.map((item: string) => {
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

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <CustomButton
          title="حذف لیست"
          onPress={() =>
            alertConfirm(() => {
              setDataList([]);
            }, "حذف")
          }
          type="red"
        />
        <CustomButton
          title="تایید نهایی و ساخت بار کد"
          onPress={() => alertConfirm(saveFinalList)}
          type="green"
        />
      </View>
      <TitleSection titles={[dataList.length, "لیست اطلاعات"]} />
      <CustomTextInput
        placeholder="جستو..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 10 }}
      />

      <FlatList
        data={filteredData}
        renderItem={renderCrudItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const DataListQRcode = ({
  dataList2,
  setDataList2,
  textInputValue,
  setTextInputValue,
}: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayExportPrint, setDisplayExportPrint] = useState(false);
  const finalDataListBase64: IFinalDataListBase64[] = [];
  const filteredData2 = dataList2.filter((item: { name: string }) =>
    item.name
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : dataList2
  );

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

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error while printing:", error);
    }
  };

  const handleEndReached = () => {
    setDisplayExportPrint(true);
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
        <CustomText>
          {index + 1}-{item.name.substring(0, 20)}
        </CustomText>
        <CustomText>{item.data}</CustomText>
        <CustomText>{item.status}</CustomText>
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

  return (
    <View style={{ flex: 1, padding: 5, width: "100%" }}>
      <TitleSection titles={[dataList2.length, "لیست QRcode"]} />
      <CustomTextInput
        placeholder="جستو..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 10 }}
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
            title="حذف لیست"
            onPress={() =>
              alertConfirm(() => {
                setDataList2([]);
              }, "حذف")
            }
          />
          <CustomButton
            title="ذخیره برای پرینت"
            onPress={() => alertConfirm(exportToPrint)}
          />
        </View>
      )}
    </View>
  );
};

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
    fontSize: 16,
    flex: 1,
  },
  cell: {
    flex: 1,
    fontSize: 16,
  },
});
