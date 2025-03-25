// firebase.js



import { initializeApp, getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';


// Firebase 구성 객체 - Firebase 콘솔에서 가져온 설정 정보를 입력하세요.
const firebaseConfig = {
    apiKey: "AIzaSyBe1PFtU89t61ULsIPIfowduJyy6PgpFB4",
    authDomain: "help-bbcb5.firebaseapp.com",
    projectId: "help-bbcb5",
    storageBucket: "help-bbcb5.appspot.com",
    messagingSenderId: "78320292657",
    appId: "1:78320292657:web:53aedeeae92644a2da9610",
    measurementId: "G-9NCCYEL925"
};

let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const firestore = getFirestore(app);


// firebas
export { app, auth, firestore };

