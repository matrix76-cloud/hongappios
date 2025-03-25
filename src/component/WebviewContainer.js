import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Alert,Text,SafeAreaView, StyleSheet, Dimensions,BackHandler,NativeModules,ToastAndroid,Modal,Pressable, Button,  Image, Linking } from "react-native";
import { WebView } from "react-native-webview";



export const LINKTYPE = {
  START: 0,
	DEVICEINFO : 1,
	CURRENTPOS :2,
  TELEPHONE:3,
}


/**
 *  웹뷰을 담아낼 컨테이너 입니다
 *  app에서 획득된 latitude 와 longitude를 가지고 실제 webview 에 onLoad 메소드를 통해 전달한다
 *  웹뷰에서 정보를 보내는 부분도 이곳에서 받는다 onMessage 메소드를 통해 전달받는다
 *  ! startInLoadingState / renderLoading 은 웹뷰가 너무 늦게 뜨는것을 방지 하기 위해 사용된다
 *  ! TODO 뒤로 가기 기능 정리가 필요하다
 * @returns 
 */
let DirectSms = NativeModules.DirectSms;
const WebviewContainer = ({ token, latitude, longitude  }) => {
  let webViewRef = useRef(null);
  const [mainpage, setMainpage] = useState(false);
  const [refresh, setRefresh] = useState(1);
  const [isCanGoBack, setIsCanGoBack] = useState(false);

  const [exitalert, setExitalert] = useState(false);
  const [starttype, setStarttype] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(()=>{
    webViewRef.current.postMessage('알림')
  },[])


  /**
   * 
   * 뒤로가기 이벤트가 오는곳
   * ! 웹에서 오는 mainpage 인지 확인 하고 종료 한다
   */
  const onPressHardwareBackButton = () => {
    
    if (webViewRef.current && isCanGoBack && mainpage == false) {
      webViewRef.current.goBack();
      console.log('back button1');
      return true;
    } else {

      if(mainpage === true){

        setExitalert(true);
        setRefresh((refresh) => refresh +1);
        // Alert.alert('', '마원 앱을 종료하시겠습니까?', [
        //   {
        //     text: '취소',
        //     onPress: () => null,
        //     style: 'cancel',
        //   },
        //   {
        //     text: '종료',
        //     onPress: () => {
        //       console.log('마원앱 종료');
        //       RNExitApp.exitApp();
        //     },
        //   },
        // ]);
        return true;
      }else{
        webViewRef.current.goBack();
        console.log('back button1');
        return true;   
      }

    }
  };

  /**
   * isCanGoBack 상태에 따라 움직인다
   * 
   */
  useEffect(() => {
    BackHandler.addEventListener(
      'hardwareBackPress',
      onPressHardwareBackButton,
    );
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        onPressHardwareBackButton,
      );
    };
  }, [isCanGoBack,mainpage]);

/**
 * 웹앱에서 오는 데이타를 받는 부분을 처리 하자
 * ! navigationStateChange 뒤로가기
 * TODO
 * ! 메인페이지의 위치가 들어왓을때 세팅 해준다
 * TODO
 * ! requestposition 현재 위치를 다시 구하라는 명령
 * TODO
 * ! smssend 문자를 보내자 자체적으로
 */
  const onMessage = async(e) =>{
    const data = e.nativeEvent.data;

    console.log("Receive message: ", data);

    if (data == 'navigationStateChange') {
      // Navigation state updated, can check state.canGoBack, etc.
      setIsCanGoBack(data.canGoBack);

    } else {
      const {command,text, url} = JSON.parse(data);
      if (command == 'requestposition') {
        console.log('receive data=====>', data);
        Geolocation.getCurrentPosition(info => {
          if (webViewRef.current) {
            let sendData = JSON.stringify({
              type: 'CURRENTPOSITION',
              data: {
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
              },
            });
            webViewRef.current.postMessage(sendData);
          }
        });
      } else if (command == 'smssend') {

  

      } else if (command == 'mainpage'){
        setMainpage(true);  
        setRefresh((refresh) => refresh +1);
      } else if(command =='subpage'){
        setMainpage(false); 
        setRefresh((refresh) => refresh +1);
      } else if(command == 'share'){
         shareToKakao(text, url);
      }
    }

  
  }


  const onLoad = async()=>{
 

    let sendData = JSON.stringify({type: LINKTYPE.START, 
      data: {token: token, latitude : latitude, longitude : longitude}});
      webViewRef.current.postMessage(sendData);
      console.log("TCL: onLoad -> sendData", sendData)
      
  }

  useEffect(()=>{
    setMainpage(mainpage);
    setExitalert(exitalert);
    setStarttype(starttype);

  },[refresh])




  return (
    
  <View style={styles.container}>

  
      <WebView 
        scalesPageToFit={true}
        ref={webViewRef}
        style={[styles.webview, {flex: isLoading == true ? (0):(1)}]}
        onLoad={()=>{onLoad();}}
        onLoadEnd={()=>{setTimeout(()=> setIsLoading(false), 2000);}}
        onMessage={onMessage}
        source={{uri: 'https://help-4902e.web.app/mobile'}}
        javaScriptEnabled = {true}
        domStorageEnabled={true}
        setSupportMultipleWindows={true}
        useWebKit={true}
        originWhitelist={["*"]}
        allowUniversalAccessFromFileURLs={true}
        onShouldStartLoadWithRequest={(event) =>{
          if(event.url.startsWith("intent://") || event.url.startsWith("kakaolink://")){
            Linking.openURL(event.url);
            return false;
          }

          return true;
        }}
      /> 


    </View>

  );

};


export default WebviewContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor :"#ff7e19",
  },
  webview: {
    flex: 1,
    overflow: 'hidden', // X축 스크롤을 숨깁니다.
    backgroundColor :"#f9f9f9",
  },


});