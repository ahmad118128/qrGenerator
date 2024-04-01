import React, { Component } from "react";
import QRCode from "react-native-qrcode-svg";

class QR extends Component {
  mRef = null;

  constructor(props: any) {
    super(props);
    this.getRef(props.value, props.size);
  }

  getRef = (value: string, size: number) => {
    return () => {
      return (
        <QRCode value={value} size={size} getRef={(ref) => (this.mRef = ref)} />
      );
    };
  };

  getQRCodeRef = () => {
    return this.mRef;
  };

  render() {
    return null; // This component doesn't render anything directly
  }
}

export default QR;
