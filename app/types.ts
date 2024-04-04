export interface ExcelItem {
  [key: string]: string;
}

export interface IFinalDataList {
  id: string;
  name: string;
  data: string;
  status: string;
}

export interface IFinalDataListBase64 extends IFinalDataList {
  qrcodeBase64: string;
}
