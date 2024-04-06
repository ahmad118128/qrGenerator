import { Alert } from "react-native";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import jMoment from "moment-jalaali";

import { FINAL_LIST_NAME } from "./constants";

export const alertConfirm = (onPressOk: () => void, title?: string) =>
  Alert.alert(
    title ?? "تایید",
    "آیا از این کار اطمینان دارید؟",
    [
      {
        text: "خیر",
        style: "cancel",
      },
      {
        text: "بله",
        onPress: onPressOk,
      },
    ],
    { cancelable: true }
  );

export const saveFinalList = async (objectDataList: any, cb: any) => {
  // convert string list to object list

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(objectDataList);

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  const uri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
  const path = `${FileSystem?.documentDirectory}${FINAL_LIST_NAME}`;

  await FileSystem.writeAsStringAsync(path, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  })
    .then((response) => {
      cb();
    })
    .catch((error) => console.log({ error }));
};

export function generateUniqueId(): string {
  const timestamp: string = Date.now().toString(36); // Convert timestamp to base36 string
  const randomStr: string = Math.random().toString(36).substr(2, 5); // Generate a random string
  return `${timestamp}-${randomStr}`; // Concatenate timestamp and random string
}

export function currentPersianDAte() {
  const currentDate = new Date();
  return jMoment(currentDate).format("jYYYY-jMM-jDD hh:mm");
}

export async function isExistFile(fileName: string) {
  try {
    const path = `${FileSystem?.documentDirectory}${fileName}`;
    const props = await FileSystem.getInfoAsync(path);
    if (props.exists) {
      return true;
    }
  } catch (error) {
    console.error("Error occurred while checking file existence:", error);
  }
  return false;
}
