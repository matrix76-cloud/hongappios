/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState,useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  Text,
  useColorScheme,
  PermissionsAndroid,
  NativeModules,
  Dimensions,
  Platform,
  View,
  ImageBackground,
} from 'react-native';
import WebviewContainer from './component/WebviewContainer';

import messaging from '@react-native-firebase/messaging';
import { app, auth } from './common/firebase';


const App= () => {

  const [token, setToken] = useState('');

  /**
   * * 웹 뷰를 띄우기전까지 초기 화면을 띄우는 역할을 진행한다
   * ! android 에서 native에서 사용 하는 모든 접근 권한에 대한 허락받는곳
   * ! 위치
   * ! 카메라 권한
   * TODO 전화번호 권한 필요 => 나중에 전화번호를 웹뷰에 넘겨 주어야 한다
   * 
   */
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [deviceid, setDeviceid] = useState('');
  const [refresh, setRefresh] = useState(1);
  const [load, setLoad] = useState(false);



  useEffect(() => {
    console.log("Firebase auth: ", auth);
  }, []);



  useEffect(()=>{
    // 토큰을 가져오는 함수 정의
    const getToken = async () => {
      try {
   
        const token = await messaging().getToken();
        console.log('TCL FCM 토큰====================================>:', token);
        setToken(token);
  
        setRefresh((refresh) => refresh +1);
        // 토큰을 서버에 저장하거나 추가 처리
      } catch (error) {
        console.log("TCL: getToken -> error", error)
     
      }
    };

    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      console.log('알림 권한 상태:', authStatus);
      setLoad(true);
  }


    // 토큰 가져오기 함수 호출
    requestUserPermission();
    getToken();


  }, [])

  useEffect(()=>{
    setLoad(load);
    setToken(token);
  },[refresh])



  return (
      <SafeAreaView style={styles.container}>
        {load == true && <WebviewContainer token ={token} latitude={latitude} longitude={longitude}/> }
      </SafeAreaView>


  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor :'#fff',
  }
});

export default App;
