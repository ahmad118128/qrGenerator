import EditScreenInfo from "@/components/EditScreenInfo";

import React, { useState, useEffect } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import { ExcelItem, IFinalDataList } from "../types";
import { FINAL_LIST_NAME } from "../constants";
import { alertConfirm, saveFinalList } from "../utils";
import { CustomButton } from "@/components/CustomButton";
import { CustomTextInput } from "@/components/CustomTextInput";
import { FontAwesome } from "@expo/vector-icons";
const { width } = Dimensions.get("window");
const qrSize = width * 0.7;

const TabOneScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [isScan, setIsScan] = useState<boolean>(false);
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [scannedData, setScannedData] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const loadList = async () => {
    const path = `${FileSystem?.documentDirectory}${FINAL_LIST_NAME}`;

    try {
      const props = await FileSystem.getInfoAsync(path);

      if (!props.exists) {
        Alert.alert(
          "file not exist",
          `got to page and create file with ${FINAL_LIST_NAME}.`
        );
        return;
      }

      FileSystem.readAsStringAsync(path, { encoding: "base64" }).then(
        (data) => {
          const workbook = XLSX.read(data, { type: "base64" });
          const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);
          setDataList(parsedData);
        }
      );
    } catch (error) {
      console.error("Error occurred while checking file existence:", error);
    }
  };

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);

    const indexObject = dataList.findIndex((item) => item.id === data);

    if (indexObject !== -1) {
      const item: IFinalDataList = dataList[indexObject];
      if (item.status !== "") {
        Alert.alert("قبلا ثبت شده است .");
        return;
      }
      Alert.alert(
        "اطلاعات صحیح است؟",
        dataList[indexObject].name,
        [
          {
            text: "yes",
            onPress: () => handleActiveEdit(indexObject),
          },
          {
            text: "خیر",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert("یافت نشد.");
    }
    // setScannedData(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleActiveEdit = (index: number) => {
    const newList = [...dataList];
    const currentObj = dataList[index];
    newList[index] =
      currentObj.status === ""
        ? {
            ...currentObj,
            date: new Date().toDateString(),
            status: "hazer",
          }
        : { ...currentObj, date: "", status: "" };

    saveFinalList(newList, () => setDataList(newList));
    // setDataList(newList);
  };

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
        }}
      >
        <Text>
          {index + 1}- {item.name.substring(0, 20)}
        </Text>
        <Text>{item.date}</Text>
        <Text>{item.status}</Text>
        <TouchableOpacity
          onPress={() =>
            alertConfirm(() => {
              handleActiveEdit(index);
            })
          }
        >
          <FontAwesome
            name={item.status ? `check` : `close`}
            size={25}
            color={item.status ? `green` : `gray`}
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const filteredData = dataList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <CustomButton
          title={!isScan ? `بار کد خوان` : `آپدیت دستی`}
          onPress={() => {
            setIsScan(!isScan);
          }}
        />
        <CustomButton title="load list" onPress={loadList} />
      </View>
      {isScan ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          style={{ width: "100%", height: "90%" }}
          // style={StyleSheet.absoluteFillObject}
        />
      ) : (
        dataList.length >= 1 && (
          <View style={{ width: "100%", padding: 10 }}>
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
              data={filteredData}
              renderItem={renderCrudItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )
      )}

      {isScan && scanned && (
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

export default TabOneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 10,
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
