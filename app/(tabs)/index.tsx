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
import { alertConfirm, currentPersianDAte, saveFinalList } from "../utils";
import { CustomButton } from "@/components/CustomButton";
import { CustomTextInput } from "@/components/CustomTextInput";
import { FontAwesome } from "@expo/vector-icons";
import { CustomText } from "@/components/CustomText";
import { CustomSwitch } from "@/components/CustomSwitch";
import { MonoText } from "@/components/StyledText";
const { width } = Dimensions.get("window");
const qrSize = width * 0.7;

const TabOneScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScan, setIsScan] = useState<boolean>(false);
  const [dataList, setDataList] = useState<ExcelItem[] | any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStartScan, setIsStartScan] = useState(false);

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
          `${FINAL_LIST_NAME} یافت نشد`,
          `به صفحه ایجاد لیست بروید و لیست نهایی را ایجاد نمایید .`
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
    const indexObject = dataList.findIndex((item) => item.id === data);
    if (indexObject !== -1) {
      const item: IFinalDataList = dataList[indexObject];
      if (item.status !== "") {
        Alert.alert("قبلا ثبت شده است .");
        setIsStartScan(false);

        return;
      }
      Alert.alert(
        "اطلاعات صحیح است؟",
        dataList[indexObject].name,
        [
          {
            text: "خیر",
            style: "cancel",
          },
          {
            text: "بله",
            onPress: () => handleActiveEdit(indexObject),
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert("در لیست بارگذاری شده یافت نشد.");
    }
    setIsStartScan(false);
  };

  if (hasPermission === null) {
    return <CustomText>در حال ارسال درخواست برای دسترسی دوربین</CustomText>;
  }

  if (hasPermission === false) {
    return <CustomText>دسترسی به دوربین داده نشده است</CustomText>;
  }

  const handleActiveEdit = (index: number) => {
    const newList = [...dataList];
    const currentObj = dataList[index];
    newList[index] =
      currentObj.status === ""
        ? {
            ...currentObj,
            date: currentPersianDAte(),
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
          padding: 10,
          borderBottomColor: "gray",
          borderBottomWidth: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CustomText>{index + 1}- </CustomText>
          <CustomText> {item.name.substring(0, 20)}</CustomText>
        </View>
        <CustomText>{item.date}</CustomText>
        <TouchableOpacity
          onPress={() =>
            alertConfirm(
              () => {
                handleActiveEdit(index);
              },
              item.status ? `ثبت غیبت` : `ثبت حضور`
            )
          }
        >
          <FontAwesome
            name={item.status ? `check` : `minus`}
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

  const toggleSwitch = () => setIsScan((previousState) => !previousState);

  return (
    <View style={styles.container}>
      {dataList.length !== 0 && (
        <CustomSwitch
          value={isScan}
          onValueChange={toggleSwitch}
          label="بارکد خوان"
        />
      )}
      {isScan && (
        <View style={{ width: "100%" }}>
          <CustomButton
            title={isStartScan ? "پایان اسکن" : "شروع اسکن"}
            onPress={() => {
              setIsStartScan((previousState) => !previousState);
            }}
            fullWidth
            type="green"
          />
          {isStartScan && (
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
              style={{ width: "100%", height: "90%" }}
              // style={StyleSheet.absoluteFillObject}
            />
          )}
        </View>
      )}
      <View>
        <CustomButton title="بارگذاری لیست" onPress={loadList} />
        <CustomText size={10}>
          توجه داشته باشید فایلی که در بخش ایجاد لیست ساخته شده در این بخش
          بارگذاری می شود
        </CustomText>
      </View>
      {dataList.length !== 0 && (
        <View style={{ width: "100%", padding: 10 }}>
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
      )}
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
    padding: 15,
  },
  title: {
    fontSize: 20,
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
