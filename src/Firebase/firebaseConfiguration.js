// Import the functions you need from the SDKs you need
import { initializeApp, } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvKExvlx1dVa2NO1EkBSGAMN4hFAYEizE",
  authDomain: "gestionfutbol-c1514.firebaseapp.com",
  projectId: "gestionfutbol-c1514",
  storageBucket: "gestionfutbol-c1514.appspot.com",
  messagingSenderId: "409521427770",
  appId: "1:409521427770:web:c0e392bde5f85e72916c03",
  measurementId: "G-KFLL6F1P1Q"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(appFirebase);
const db = getFirestore(appFirebase);
// Obtén una referencia al servicio de almacenamiento
//const storage = firebase.storage();

export {db, appFirebase};