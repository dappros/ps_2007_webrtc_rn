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
  TouchableOpacity
} from 'react-native';

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

const socket = io('https://socket.vconf.net:8080',{autoConnect: false,transports: ['websocket']});

const iceServers = [
  { 'urls': 'stun:stun.l.google.com:19302' },
  { 'urls': 'turn:numb.viagenie.ca', 'username': 'numb-server@matraex.com', 'credential': 'pass2app@' }
];
let pcs={}


function sendQuickNotice(code){
  // if(this.state.code){
    // this.socket.emit("quicknoticeevent","addacam",this.state.code,{name:'Michael Blood'})

    socket.emit("quicknoticeevent","addacam",code,{name:"Vineeth Nambiar"})
  // }
}
class App extends React.Component{
  constructor(props){
    super(props)
    this.state={
      code:"",
      stream:null,
      toggleView:true
    }
    
  }

  getPc(id){
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

  socketListeners(){
    socket.on('connect', () => console.log('Socket is connected'));
    socket.on('connect_error',(error)=>console.log(error,'error'))


    socket.on("quicknoticemessage",(type,code,message)=>{
      console.log(message,'message')
      let payload = message;
      let pc = this.getPc(message.from)

      if(message.payload!=undefined)
        payload=message.payload
        
      else if(message.message!=undefined)
        payload=message.message

      if (payload.ice!=undefined&&payload.ice==null) 
      { 
        console.log("Ice receive null - ignore", message) 
        return
      }

      else if (payload.ice) 
      { 
        console.log('Console.log - received ice ',payload);
        pc.addIceCandidate(new RTCIceCandidate(payload.ice)).catch(e => {
            console.log("Failure during addIceCandidate(): " + e.name);
          });  // at one point this was really confusing,   when the remote side sends us an ice event,  we need to add the candidate to our list 
        return
      }

      else if(payload=='requestdevice')
      {

        mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30
            },
            facingMode: "user",
          }}).then(stream=>{
          this.setState({stream,toggleView:true});
          // stream.getTracks().forEach(track=>{
          //   console.log(pc.addTrack,'this is addtrack funct')
          //   pc.addTrack(track, stream)
          // });
          // const audio = stream.getAudioTracks()
          // audio.forEach(audioTrack=>{
          //   stream.removeTrack(audioTrack)
          // })
          console.log(stream,'addtrack')
          
          pc.addStream(stream);
        }).then(()=>{
          return pc.createOffer()
        }).then((offer)=>{
          pc.setLocalDescription(offer).then(async()=>{
            // offer.sdp = offer.sdp.replace('a=group:BUNDLE video','a=group:BUNDLE 0')
            // offer.sdp = offer.sdp.replace('a=mid:video', 'a=mid:0')
            console.log(offer.sdp,'thisissdp')
            let sendoffer={to:message.from, payload:offer}
            console.log("sending quicknoticemessageregistered (a)",sendoffer);
            socket.emit("quicknoticemessageregistered",type,code,sendoffer)
          });
          
        })
        .catch(function(err){
          console.trace() ; 
          console.log("Error received in return call:"+err);
        })
      }
      else if(payload.type=='answer'){
        console.log("received answer",message);
        pc.setRemoteDescription(payload)
        .catch(function(err){
          console.trace() ; 
          console.log("Error received in return call:"+err);
        })
      }else
        console.log("receveid invalid message",payload);
      
    })


  }

  componentDidMount(){
    console.log('will connect....')
    socket.connect()
    this.socketListeners()
  }

  

  onSuccessScan(e){
    
    const code = e.data.split('https://addcam.io/c/')[1]
    console.log(code)
    sendQuickNotice(code);
  }

  render()
  {
    let url = "https://www.radiantmediaplayer.com/media/big-buck-bunny-360p.mp4"
    return (
      <SafeAreaView style={{flex:1, margin:20}}>
        <View style={{flex:1, alignItems:'center'}}>
          <TextInput placeholder="Place code here or press the scan button" onChangeText={(code)=>this.setState({code})}
          style={{borderWidth:1, width:'90%', height:34, borderRadius:4, borderColor:'#ccc'}}
          />
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

          {this.state.stream&&this.state.toggleView?
            <RTCView style={{ width:960, height:720}} mirror streamURL={this.state.stream.toURL()}/>:null
          }
        </View>
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
  }
})

export default App;
