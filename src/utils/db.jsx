// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { ethers } from "ethers";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_StorageBucket,
  messagingSenderId: import.meta.env.VITE_MessagingSenderId,
  appId: import.meta.env.VITE_AppId,
  measurementId: import.meta.env.VITE_MeasurementId,
};

// Initialize Firebase
export const dbApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(dbApp);


// Use JsonRpcProvider for custom RPC URL
const provider = new ethers.providers.JsonRpcProvider("https://base-sepolia-rpc.publicnode.com");


// Create a wallet using the private key
export const wallet = new ethers.Wallet(import.meta.env.VITE_PRIVATE_KEY, provider);
