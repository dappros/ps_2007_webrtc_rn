/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  FlatList
} from 'react-native';

import { NativeRouter, Route, Link } from "react-router-native";

import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  mediaDevices
} from 'react-native-webrtc';
import ConnectItem from './ConnectItem';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import io from 'socket.io-client';

const screenArray = ['path'];

const stateStream = [];

class App extends React.Component{
  constructor(){
    super()
    this.state={
      path: 0,
    }
  }

  renderRouteItem = (i) => {
    return (
      <Route path={`/path${i}`} render={() => <ConnectItem index={i} stateStream={stateStream} stateStreamPush={this.stateStreamPush} />} />
    )
  }

  stateStreamPush = (url) => {
    stateStream.push(url)
  }

  renderLinkItem = (i) => {
    return (
      <Link
        onPress={()=>{
          this.setState({code: screenArray[i]})
        }}
        to={`/path${i}`}
        underlayColor="#f0f4f7"
        style={styles.navItem}
      >
        <Text>Path {i}</Text>
      </Link>
    )
  }


  render(){
    console.log(stateStream, 'stateStream');
    return (
      <SafeAreaView style={{flex:1, margin:20}}>
        <NativeRouter style={{flex:1}}>
          { screenArray.map( (e, i) => {
              return this.renderRouteItem(i)
            })
          }

              <View style={styles.nav}>
                {screenArray.map( (e, i) => {
                    return this.renderLinkItem(i)
                  })
                }
                <TouchableHighlight
                  onPress={()=>{
                    screenArray.push(`path${this.state.path}`),
                    this.setState({
                      path: ++this.state.path
                    })
                  }}
                >
                  <Text>Add</Text>
                </TouchableHighlight>
              </View>

        </NativeRouter>
      </SafeAreaView>
    )
  }
};

const styles = StyleSheet.create({
  buttonStyles:{
    backgroundColor:'#ccc',
    width:'90%',
    height:34,
    borderRadius:4,
    justifyContent:'center',
    alignItems:'center'
  },
  nav: {
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  borderTopWidth: 1,
  borderColor: "#000",
},
navItem: {
  flex: 1,
  alignItems: "center",
  paddingTop: 10
}
})

export default App;
