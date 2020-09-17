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
} from 'react-native';

import { NativeRouter, Route, Link } from "react-router-native";

import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  mediaDevices
} from 'react-native-webrtc';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import io from 'socket.io-client';

console.disableYellowBox = true;

export const socket = io('https://socket.vconf.net:8080',{autoConnect: false,transports: ['websocket']});

const iceServers = [
  { 'urls': 'stun:stun.l.google.com:19302' },
  { 'urls': 'turn:numb.viagenie.ca', 'username': 'numb-server@matraex.com', 'credential': 'pass2app@' }
];
let pcs={}

const sendQuickNotice = (code) => {
  console.log("called")
    socket.emit("quicknoticeevent","addacam",code,{name:"Vineeth Nambiar"})
}

const mediaStream = mediaDevices.getUserMedia({
  audio: false,
  video: {
    mandatory: {
      minWidth: 500, // Provide your own width, height and frame rate here
      minHeight: 300,
      minFrameRate: 30
    },
    facingMode: "user",
  }})

state={
  code:"",
  stream:null,
  toggleView:true,
  path: 1,
}


const getMediaStream = () => new Promise((resolve,reject)=>{
    resolve(mediaStream)
})

class ConnectItem extends React.Component{
  constructor(props){
    super(props)
    this.state={
      code:"",
      stream:null,
      toggleView:true,
      path: 1,
    }
  }

  componentDidMount = () => {

    socket.connect()
    socket.on('connect', () => {
      console.log(socket.connected); // true
    });
    this.socketListeners();
  }

  componentWillUnmount = () => {
    socket.on('disconnect', () => {
      console.log(socket.connected); // false
    });
  }


    socketListeners = () => {
      socket.on('connect', () => console.log('Socket is connected'));
      socket.on('connect_error',(error)=>console.log(error,'error'))

      socket.on("quicknoticemessage",(type,code,message)=>{
        console.log(type,code)
        console.log(',message',message)
        let payload = message;
        let pc = this.getPc(message.from)

        if(message.payload!=undefined)
          payload=message.payload

        else if(message.message!=undefined)
          payload=message.message

        if (payload.ice!=undefined&&payload.ice==null)
        {

          return
        }

        else if (payload.ice)
        {

          pc.addIceCandidate(new RTCIceCandidate(payload.ice)).catch(e => {

            });  // at one point this was really confusing,   when the remote side sends us an ice event,  we need to add the candidate to our list
          return
        }

        else if(payload=='requestdevice')
        {

          // mediaDevices.getUserMedia({
          //   audio: false,
          //   video: {
          //     mandatory: {
          //       minWidth: 500, // Provide your own width, height and frame rate here
          //       minHeight: 300,
          //       minFrameRate: 30
          //     },
          //     facingMode: "user",
          //   }}).then(stream=>{
          //   this.setState({stream,toggleView:true});
          //   // stream.getTracks().forEach(track=>{
          //   //   console.log(pc.addTrack,'this is addtrack funct')
          //   //   pc.addTrack(track, stream)
          //   // });


          //   pc.addStream(stream)
          // }).then(()=>{
          //   return pc.createOffer()
          // }).then((offer)=>{
          //   pc.setLocalDescription(offer).then(()=>{
          //     let sendoffer={to:message.from, payload:offer}

          //     socket.emit("quicknoticemessageregistered",type,code,sendoffer)
          //   });

          // })
          // .catch(function(err){

          // })
          getMediaStream().then(stream=>{
            this.setState({stream,toggleView:true});
            pc.addStream(stream);
          }).then(()=>{
            return pc.createOffer();
          }).then((offer)=>{
            pc.setLocalDescription(offer).then(()=>{
              let sendoffer={to:message.from, payload:offer}
              socket.emit("quicknoticemessageregistered", type, code, sendoffer)
            });
          }).catch(function(err){
            console.log(err);
          })

        }
        else if(payload.type=='answer'){

          pc.setRemoteDescription(payload)
          .catch(function(err){
            console.trace() ;
          })
        }else
          console.log("receveid invalid message",payload);

      })


    }

    getPc = (id) => {
      if(pcs[id]==undefined)
      {
        pcs[id] = new RTCPeerConnection({
          "iceServers": iceServers
        })

        pcs[id].onicecandidate = (event)=>{
          console.log(event.candidate,'icecandy')
          socket.emit("quicknoticemessageregistered","addacam",this.state.code,{ice: event.candidate, to:id})
        }
      }
      return pcs[id];
    }

    onSuccessScan = (e) => {
      console.log(e, 'e')
      const code = e.data.split('https://addcam.io/c/')[1]
      console.log(code, 'code');
      sendQuickNotice(code);
    }

  render() {
    console.log(this.state.code, '170')
    console.log(this.state.stream, '171')
    if(this.state.stream){
      this.props.stateStreamPush(this.state.stream);
      this.setState({stream: ''})
    }
    console.log(this.props.stateStream[this.props.index], '176');
    console.log(this.state.toggleView, '177')
    let url = "https://www.radiantmediaplayer.com/media/big-buck-bunny-360p.mp4"
    return (
      <View style={{flex:3, height: 300, alignItems:'center'}}>
        <TextInput placeholder="Place code here..." onChangeText={(code)=>this.setState({code})}
        style={{borderWidth:1, width:'90%', height:34, borderRadius:4, borderColor:'#ccc'}}
        />
        <Text>{this.props.index}</Text>
        <TouchableOpacity onPress={()=>sendQuickNotice(this.state.code)} style={[styles.buttonStyles,{marginTop:10}]} >
          <Text>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>this.setState({toggleView:false})} style={[styles.buttonStyles,{marginTop:5}]} >
          <Text>Scan</Text>
        </TouchableOpacity>

        {!this.state.toggleView?
          <QRCodeScanner
          onRead={this.onSuccessScan}
        />:null
        }

        {this.props.stateStream[this.props.index]&&this.state.toggleView?
          <RTCView style={{ width:720, height:960}} mirror streamURL={this.props.stateStream[this.props.index].toURL()}/>:null
        }
      </View>
    )
  }

}


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

export default ConnectItem;
