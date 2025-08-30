import CryptoJS from "crypto-js";
import forge from "node-forge";
// 导入浏览器原生加密API类型
type AlgorithmIdentifier = Algorithm | string;
type KeyUsage =
  | "encrypt"
  | "decrypt"
  | "sign"
  | "verify"
  | "deriveKey"
  | "deriveBits"
  | "wrapKey"
  | "unwrapKey";

// RSA加密函数（原生支持 需https）
export const rsaEncrypt = async (
  data: string,
  publicKey: string
): Promise<string> => {
  // 将PEM格式的公钥转换为ArrayBuffer

  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKey.replace(pemHeader, "").replace(pemFooter, "");

  const binaryDerString = window.atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);

  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  // 导入公钥
  const cryptoKey = await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  // 加密数据
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    cryptoKey,
    encodedData
  );

  // 将加密后的数据转换为Base64字符串
  const key = window.btoa(
    String.fromCharCode(...new Uint8Array(encryptedData))
  );
  return key;
};

// 加密数据
export const encryptData = async (
  data: { [key: string]: any },
  publicKey: string
) => {
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
  const publicKeyInstence = forge.pki.publicKeyFromPem(publicKey);
  const ciphertext = publicKeyInstence.encrypt(
    encodeURIComponent(aesKey),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    }
  );
  console.log(ciphertext);

  return {
    data: encryptedData,
    key: forge.util.encode64(ciphertext),
    iv: iv.toString(CryptoJS.enc.Hex),
  };
};
