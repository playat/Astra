import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";

const publicKey = "";

// 加密数据
export const encryptData = (data: { [key: string]: any }) => {
  const aesKey = CryptoJS.lib.WordArray.random(16).toString();
  const iv = CryptoJS.lib.WordArray.random(16);
  // 用AES加密数据
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Utf8.parse(aesKey),
    {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv,
    }
  ).toString();

  // 用RSA加密AES密钥
  const encrypt = new JSEncrypt.JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encryptedAesKey = encrypt.encrypt(aesKey);

  return {
    data: encryptedData,
    key: encryptedAesKey,
    iv: iv.toString(CryptoJS.enc.Hex),
  };
};
