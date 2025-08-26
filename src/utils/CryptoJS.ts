import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";

const publicKey = "";
// 生成随机AES密钥
export const generateAesKey = () => {
  const key = CryptoJS.lib.WordArray.random(16).toString(); // 16字节=128位
  return key;
};

// 加密数据
export const encryptData = (data: { [key: string]: any }) => {
  const aesKey = generateAesKey();
  const iv = CryptoJS.lib.WordArray.random(16);
  // 用AES加密数据
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), aesKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv
  }).toString();

  // 用RSA加密AES密钥
  const encrypt = new JSEncrypt.JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encryptedAesKey = encrypt.encrypt(aesKey);

  return encryptedAesKey;
};
