"use strict";

class ADDACAM {
  construtor() {}

  init( divid, config) {
    var addacamobj = this;
    this.config = ADDACAM_CONFIG;
    console.log('config', this.config);
    
    if (config) for (var i in config) if (typeof config[i] == 'object') {
      this.config[i] = {};

      for (var j in config[i]) this.config[i][j] = config[i][j];
    } else {
      this.config[i] = config[i];
    }
    if(this.config.showqr==true)
    { 
        var el = document.createElement('script');  
        el.src = "https://addcam.io/qrcode.js";
        el.onload = function() { addacamobj._display_qrcode( addacamobj.config.startingcode)}
        document.body.appendChild(el)
    }else
        this.config.showqr   =  false
        
    if (divid) {
        this.config.divid = divid
      this._attach_container(divid); 
      this._message('ADDCAM loaded div: ' + this.divid, this.container);
    }

    if (!this.config.auto_start) {
      this._message("NOT autostarting"); 
      return;
    }

    this._message("autostarting");

    this.start();
    return this;
  }

  start() {
    if (typeof this.container != 'object') {
      this._error('start()', 'container is not an object - use _attach_container(container)'); 
      return;
    }

    this._checksetup();

    var contents = this._get_contents();
    
    if(this.config.startingcode!=undefined&&this.config.startingcode!=false)
        this._listenforcode(this.config.startingcode)
    else 
      this.invitephonenumber(false); 
    this._status('awaiting');
  }

  invitephonenumber(phn) {
    var addacamthisref = this;
    return this._sendphonerequest(phn, function (ret) {
      addacamthisref.handlephonerequest(ret); 
    }, function (errormessage) {
      addacamthisref._set_currentstatus(errormessage);
    });
  }
    _newpc(code)
    {
        
        var addacamobj = this;
            var pc = new RTCPeerConnection(this._iceconfig);
            this.currentpc = pc
            pc.onicecandidate = function (event) {
             // console.log("FOund ice candidate to send", event);
            // when we get another ice candidate,   we need to pass it to the host ....
              addacamobj._socket.emit("quicknoticemessagehost", "addacam", code, {ice: event.candidate});
            };
            pc.onconnectionstatechange = function(event) {
                console.log("PeerConnection state change:"+pc.connectionState)
              switch(pc.connectionState) {
                case "connected":
                  // The connection has become fully connected
                  break;
                case "disconnected":
                case "failed":
                  // One or more transports has terminated unexpectedly or in an error 
                case "closed":
                    //lets cleanup and reset....
                    addacamobj._message("PeerConnection closed - cleaning up:"+pc.connectionState)
                    
                    if(addacamobj.currentpc==null)
                        break;
                        
                    addacamobj.currentpc=null
                    addacamobj._message("PeerConnection closed - cleaning up:"+pc.connectionState, addacamobj.config.on_peerconnectionclose)
                    if(addacamobj.config.on_peerconnectionclose && typeof(addacamobj.config.on_peerconnectionclose)  == 'function')
                    {//allow a call back instead of resetting
                        try{
                            addacamobj.config.on_peerconnectionclose(addacamobj);
                        }catch(ex){// if it fails reset
                            addacamobj.reset()
                        }
                        return;
                    } 
                    addacamobj.reset()
                  // The connection has been closed
                  break;
              }
            }
            pc.ontrack = function (event) {
              console.log("received a track event", event); //alert("Adding Stream")
              //  console.trace()
         
              var video = addacamobj._getvideo();                          
              if(video==null)
              {
                addacamobj._error("_config","config.video_display_id: invalid: "+video_display_id+" Not a valid <video>")
                return        cont
              }                  
              
              console.log("video get", video);
              video.autoplay = true;
              video.srcObject = event.streams[0]; // 
              video.muted = true; //this helps the stream from mobile app to run in autoplay otherwise need to enable controls and press play button
              event.streams[0].getVideoTracks().forEach(function(track){
                track.onended = function(event)
                {
                    console.log("trackeneded");
                }  
              })
              addacamobj._status('playing');
              video.play(); // alert("Done Adding Stream")
            };
         return pc;
    }
  handlephonerequest(ret) {
    // this  might need to be  a different method called notify external world of usingi call back
    console.log("callback value", ret);
    console.log("Here is the code we'll use:", ret.code);
    this.sendrequestphonenumber = ret.phonenumber;
    this.sendrequestcode = ret.code;
    
    this._listenforcode(ret.code, ret.hidecode);

    if (ret.message) this._set_currentstatus(ret.message);
  }
  _display_qrcode(code)
  {
    // if already displayed with the same code, skip it,  otherwide replace it.
    
    // if there is not code found yet,  skip it
    if(!code)
        code = this.sendrequestcode
    if(typeof(code)!='string')
        code = this.sendrequestcode
        
    if(!code)
    {
        console.log("_display_qrcode:can not display the  qrcode yet,  it is not set")
        return   
    }
    console.log("_display_qrcode:setting up :"+code)
    if(window['QRCode']==undefined)
    {
       // console.trace()
        //console.log("attempted to run display_qrcode - however it is not ready:"+code)
        return
    }
    else
      ;//  console.log("running :"+code)
   var qrel =document.getElementById(this.config.qrcode_id)
   qrel.innerHTML = '';
   var qrcode = new QRCode(qrel, {
    	width : 100,
    	height : 100
    });
    qrcode.makeCode("https://addcam.io/c/"+code)
    
  }
   
  _listenforcode(code, hidecodediv) {
    if(this.config.startingcode==undefined||this.config.startingcode!=code)
        if(this.config.on_codechange!=undefined&&typeof(this.config.on_codechange)=='function')
            this.config.on_codechange(code);
    var codediv;
    if(this.currentpc!=undefined)
    {
        console.log("Closing Current PeerConnection", this.currentpc)
        this.currentpc.close()
    }
    if (this.config.code_display_id) {
      codediv = document.getElementById(this.config.code_display_id);
    } else codediv = document.querySelector('.addacam-displaycode');
    this._display_qrcode(code)
    if (hidecodediv) codediv.style.display = 'none';else codediv.style.display = '';
    codediv.innerHTML = code; //download the socket io script and connect to vconf socket - register that we are gonna listen for the camera provider on the socket

    var el = document.createElement('script');
    var addacamobj = this;

    var pc = null
    //pc.restartIce();
    this.currentpc = pc;
    console.log('ran _listenforcode ', pc);
    
    
    el.onload = function () {
      var _socket = io('https://socket.vconf.net:8080', {
        autoConnect: false
      });

      addacamobj._socket = _socket;

      _socket.on("connect", function () {
        console.log(new Date()+"sending listenforprovider" + code);
        var params = {
            id: addacamobj.config.account_id
            , apikey : addacamobj.config.account_apikey
            , apisecret : addacamobj.config.account_apisecret
            , domain: window.location.host
        }
        _socket.emit("quicknoticeregister", "addacam", code,params,function(msg){
            console.log('quicknoticeregister success:'+msg);
            //this is where we should be displaying the code and stuff
            
           
        }, function(err){
            console.error(new Date()+'addcam failure:'+err);
            if(addacamobj.config.on_registerfailure!=undefined)
            {
                console.error(new Date()+'addcam register / connect failure:'+err+'\n Callback',addacamobj.config.on_registerfailure);
                addacamobj.config.on_registerfailure(err);
            }
            else
                console.error(new Date()+'addcam register / connect failure:'+err,params);
        })
      });

      _socket.on("quicknoticeevent", function (type, code, params) {
        console.log(new Date()+"quicknoticeevent - sending quicknoticemessagehost - requestdevice" + code);
         
        if(pc==null)
        {
            pc = addacamobj._newpc(code)
        }
        _socket.emit('quicknoticemessagehost', type, code, {
          message: 'requestdevice'
        });
      });

      _socket.on("quicknoticemessage", function (type, code, message) {
        var payload = message;
        var sendpayload = 0;
        if(typeof(payload.payload)!='undefined')
        {
            sendpayload = 1;
            payload = payload.payload;
        }
        console.log(new Date()+"recieiving message quicknoticemessage: payload "+payload.type + code, payload);
        if (payload.ice) 
        { 
            console.log(new Date()+"quicknoticemessage - received ice: ",payload);
            //when the ice candidate is passed to us,   we need to track it
            ///*
            pc.addIceCandidate(new RTCIceCandidate(payload.ice)).catch(e => {
                console.log(new Date()+"Failure during addIceCandidate(): " + e.name);
            });
          //
          return ;
        } 
        if (payload.type == 0||payload.type == 'offer') {  //swift makes payload offers with type == 0
          pc.setRemoteDescription(new RTCSessionDescription({
            type: "offer",
            sdp: payload.sdp
          })).then(function () {
            return pc.createAnswer();
          }).then(function (answer) {
            pc.setLocalDescription(answer, function () {
              var sendmessage = {}
              if(sendpayload)
                sendmessage.payload = answer
              else
                sendmessage = answer
              //sendmessage.to = message.from 
              console.log(new Date()+"sending answer", sendmessage);

              _socket.emit("quicknoticemessagehost", type, code, sendmessage);
            });
          });
          this.localRTCPeerConnection = pc;
        }
      });

      _socket.connect();
    };

    el.src = "https://addcam.io/socket.io.js";
    document.body.appendChild(el);
  }
  _getvideo()
  {
      var video_display_id = 'addacam_video';
      if(this.config.video_display_id!=undefined)
        video_display_id =this.config.video_display_id
      var video = document.getElementById(video_display_id)                          
      if(video==null)
      {
        this._error("_config","config.video_display_id: invalid: "+video_display_id+" Not a valid <video>")
        return 
      } 
      return video
  }
  reset()
  {
      var video = this._getvideo();  
      console.log('video',video);
      video.pause() 
      this._status('awaiting');
      if(this.currentpc!=null)
        this.currentpc.close()
      this.currentpc=null
      
      this.invitephonenumber(false)
  }
  stop()
  { 
    //this._socket.emit('quicknoticeunregister',this.quickconnecttype,this.sendrequestcode)
    
      if(this.currentpc!=undefined)
        if(this.currentpc!=null)
            if(this.currentpc.connectionState=='connected')
                this.currentpc.close()
      var video = this._getvideo();                          
      if(video==null)
      {
        addacamobj._error("_config","config.video_display_id: invalid: "+video_display_id+" Not a valid <video>")
        return       
      }         
      video.pause()
      this._status('stop');
  }
  close()
  {
    this._message("_close","container.remove");
    this.stop()
    this.container.remove(); 
  }
  _status(st)
  {
        this.container.setAttribute('addcam-status',st);
        document.body.setAttribute('addcam-status',st);
        if(this.config.on_status!=undefined&&typeof(this.config.on_status)=='function')
            this.config.on_status(st);
            
  }    
  _webrtcparams() {
    //first time,   create the params,   then use the same ones...... to past through.
    return {};
  }

  _socket_end() {
    this._socket.close();

    this._socket.destroy();

    this._socket = null;
  }

  _sendphonerequest(phn, successcallback, errorcallback) {
    if (phn === false) ;else if (!phn.match(/^\d{10}$/)) {
      this._set_instructions('Please enter a valid 10 digit phone number ' + phn);

      return;
    }
    fetch("https://dev.tasket.com/addacam-phonenumber.php?sendrequesttophonenumber=" + phn, {
      method: "Get"
    }).then(res => res.json()).then(ret => {
      if (ret.error) {
        errorcallback(ret.error);
        return;
      }

      successcallback(ret); //callback(ret)
    });
  }

  _set_instructions(txt) {
    this.container.querySelector('.addacam-instructions').innerHTML = txt;
  }

  _set_currentstatus(html) {
    if (this.config.status_display_id) document.getElementById(this.config.status_display_id).innerHTML = html;else this.container.querySelector('.addacam-currentstatus').innerHTML = html;
  }

  _append_currentstatus(dom) {
    console.log("appending", dom);
    this.container.querySelector('.addacam-currentstatus').append(dom);
  }

  _get_contents() {
    if(this._checksetup())
        return this.container.querySelector(' .addacam-contents ');
    return "";
  }

  _checksetup() {
    var addacamthisref = this;
    this.phonenumbertemp = '';
    if (typeof this.config.css == 'object') for (var i in this.config.css) this.container.style[i] = this.config.css[i];
    if(this.container==null)
    {
        console.log("Config setup for ref",this.config);
        console.log("Container:",this.container);
        this
        console.error("addcam._checksetup: this_container == null - fail");
        return false;
    }
    var check1 = this.container.querySelector(' .addacam-error-message ');
    var check2 = this.container.querySelector(' .addacam-contents ');
    var check3 = this.container.querySelector(' .addacam-displaycode ');
   // if (check1 == null && check2 == null) this.container.innerHTML = '';  //danger,   never clear out the contents....

    if (check1 == null) {
      var div = document.createElement("div");
      div.className = 'addacam-error-message';
      this.container.appendChild(div);
    }

    if (check1 == null) {
      var div = document.createElement("div");
      div.className = 'addacam-contents';
      this.container.appendChild(div); //  var video =document.createElement("video");
      //  video.id='addacam_video'
      //  this.container.appendChild(video); 
    }
    if(this.config.showqr)
    {
        if(this.config.qrcode_id!=undefined)
        {
            var div = document.getElementById(this.config.qrcode_id) 
            if(div==null)
            {
                
                this.config.qrcode_id=false
            }
        }
        if(this.config.qrcode_id==undefined||this.config.qrcode_id==false)
        {
            this.config.qrcode_id = 'random-qrcode-'+(new Date()).getMilliseconds()
             var div = document.createElement("div");
              div.id = this.config.qrcode_id;
              this.container.appendChild(div); 
                    
        } 
    }
    var contents = this.container.querySelector('.addacam-contents');
    if(this.config.video_display_id==undefined)
    {
        var video = document.createElement("video");
        this.config.video_display_id = 'random-video-'+(new Date()).getMilliseconds()
        video.id = this.config.video_display_id;
        this.container.appendChild(video);
        
    }
    if (this.config.code_display_id) {
      ;
    } else if (check3 == null) {
      var div = document.createElement("div");
      div.className = 'addacam-displaycode';
      div.innerHTML = 'XXXXXX';
      contents.appendChild(div);
    }

    var check2 = contents.querySelector(' div.addacam-instructions ');

    if (check2 == null) {
      var div = document.createElement("div");
      div.className = 'addacam-instructions';
      div.innerHTML = '';
      contents.appendChild(div);
    }

    var check1 = contents.querySelector('.addacam-currentstatus ');

    if (check1 == null) {
      var div = document.createElement("div");
      div.className = 'addacam-currentstatus';
      contents.appendChild(div);
    }

    if (this.config.embed_phonenumber_prompt) {
      var check1 = contents.querySelector(' input.addacam-phonenumber-input ');

      if (check1 == null) {
        var input = document.createElement("input");
        input.className = 'addacam-phonenumber-input addacam-input';
        input.setAttribute('type', 'phone');
        input.setAttribute('size', '10');
        input.setAttribute('maxwidth', '10');
        contents.appendChild(input);
        var btn = document.createElement("input");
        btn.className = 'addacam-submit  addacam-input';
        btn.setAttribute('type', 'button');
        btn.setAttribute('value', 'Invite Phone');
         btn.removeEventListener("click", function (e) {
          var phn = input.value;

          addacamthisref._sendphonerequest(phn, function (ret) {
            handlephonerequest(ret);
          }, function (errormessage) {
            addacamthisref._set_currentstatus(errormessage);
          });
        }, false);
        btn.addEventListener("click", function (e) {
          var phn = input.value;

          addacamthisref._sendphonerequest(phn, function (ret) {
            handlephonerequest(ret);
          }, function (errormessage) {
            addacamthisref._set_currentstatus(errormessage);
          });
        }, false);
        contents.appendChild(btn);
      }
    }

    if (this.config.phonenumber_textbox) {
    
        var el = document.getElementById(this.config.phonenumber_textbox);
        if(el==null)
        {
            this._error("_checksetup","_checksetup.phonenumber_textbox :"+this.config.phonenumber_textbox+" is not a valid dom element")
            return
        } 
         
        el.addEventListener('change', function (e) {
        addacamthisref.phonenumbertemp = this.value;
      });
    }

    if (this.config.phonenumber_attachclick_id) {
      document.getElementById(this.config.phonenumber_attachclick_id).addEventListener('click', function (e) {
        addacamthisref.invitephonenumber(addacamthisref.phonenumbertemp);
      });
    } //console.log('check',check);
    return true;
  }

  _attach_container(divid) { 
    if (typeof divid == 'string') {
      this.divid = divid;
      this.container = document.getElementById(divid); 
    } else if (typeof divid == 'object') {
      this.container = divid;
      this.divid = container.id; 
    } else 
        this._error('_attach_container', 'divid is not valid', divid);
    if(this.container==null)
    {
        this._error("addcam: error connecting to divid:"+divid);
        return false
    }
    this._message('_attach_container b',this.container);
  }

  _attach_console(obj) {
    if (typeof obj == 'string') obj = document.getElementById(obj);
    if (typeof obj != 'object') _error('_attach_console', 'obj is not an object', obj);
  }

  _error(type, message, ref) {
    console.error('ADDACAMERROR:' + type + ':' + message, ref);
    return;
  }

  _message(type, message, ref) {
    console.log('ADDACAMMESSAGE:' + type + ':' + message, ref);
    return;
  }

} //default configuation


var ADDACAM_CONFIG = {
  embed_phonenumber_prompt: false,
  auto_start: true,
  showqr: true,
  onconnectionclose: 'reset',
   
};