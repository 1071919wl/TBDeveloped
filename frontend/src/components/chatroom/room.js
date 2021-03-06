import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import '../../assets/stylesheets/reset.css';
import '../../assets/stylesheets/room.scss';



const Room = (props) => {


    //!TEST
        let [peers, setPeers] = useState([]);
        const [mute, setMute] = useState('Mute');
        const [video, setVideo] = useState('Video Off');
        const[trigger, setOn] = useState('off');
    //!TEST
        // const [test, setTest] = useState(0);


    //!TEST
        
        
    // const [mute, setMute] = useState('Mute'); 
    // const [video, setVideo] = useState('Video Off');

    const userVideo = useRef(); //for video html
    const partnerVideo = useRef(); //for video html
    const peerRef = useRef(); //rtc peerConnection
    const socketRef = useRef();
    const otherUser = useRef(); //otherUser - generated ID
    const userStream = useRef();
    // const setPeers = useRef();
    

    // 1/1/21 test
    const otherVideos = useRef(new Array());
    const otherUsers = useRef(new Array()); 
    // const peers = useRef(new Object()); 
    const otherUserName = useRef("")
    // 1/1/21 test

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(MediaStream => {
            userVideo.current.srcObject = MediaStream;
            userStream.current = MediaStream;

            socketRef.current = io.connect("/");

            
            socketRef.current.emit("send name", props.user)
            socketRef.current.on("receive name", userName => {
                otherUserName.current = userName
                setOn('on');
            })
            
            socketRef.current.emit("join room", props.match.params.roomID);
            
            // has the socket emit this event, this event is caught by the server. I believe there's some 
            // 'long polling' involved. Interesting because the connection happens while this is on localhost 3000
            // and the server is on 5000  

        
            // i believe the below code only runs when the events happen, after the above event is emitted
            // it triggers a slew of events on the server side 
            socketRef.current.on('other user', userID => {
                callUser(userID);
                otherUser.current = userID;


                // 1/1/21 test
                otherUsers.current.push(userID) 
                    // may have to concat in a situation where a user joins 
                    // and there are multiple existing users
                    // they would have to make a call to each of the existing users

              

            });

            // the above event is emitted from the server back to the client who created a chatroom, it basically 
            // it basically says to the user, hey there's someone in this room 
            // likely whats happening is someone clicked on a room link and this component mounts and they're alerted
            // that there's another user, and also given the other users socket id 
            // so if the above happens then two users are sitting in the same room. 
            // but their sockets need to connect 
            // this i where the callUser function comes in. Essentially it calls the OTHER USER  

            socketRef.current.on("user joined", userID => {

                otherUser.current = userID;

                otherUsers.current.push(userID)
                // this may not need concat because it should only
                // be one user being added at a time 
                // this is from the perspective of existing users in the room 

            });

            socketRef.current.emit("user joined", userID => {
                otherUser.current = userID;

            });
            


            socketRef.current.on( "user left", id => {
                const peerObj = peerRef.current.find(p => p.peerID === id);
                if (peerObj){
                    peerObj.peer.destroy();
                }
                const peers = peerRef.current.filter(p => p.peerID !== id);
                peerRef.current = peers;
                setPeers(peers); //state
                
            })
           

            socketRef.current.on("offer", handleRecieveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);

            socketRef.current.on("killconnection", killIt);
        });

    }, []);

  

    function callUser(userID) {
        peerRef.current = createPeer(userID); 
        // userID is the socket.id of the OTHER PERSON in the room 
        // it is used in the createPeer function and set to the peerRef hook  
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        //giving our peer individual access to our stream so they can view on their end
    }
    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        }); 
        // this constructor takes in an array of objects, these objects are servers which allow peers to connect, should 
        // use your own, look into creating one 

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

        return peer;

        // still in the process of calling the other user/ connecting to the other users socket 
        //starts off by instantiating a RTCPeerConnection, this is used to connect two peers and maintain the connection

    }

    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer().then(offer => { // createOffer is a RTCPeerConnection method
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit("offer", payload);
        }).catch(e => console.log(e));
    }

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        })
    } // this function is handling events related to someone calling the user 

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    } 

    // this handles answers both for the caller and the callee because it essentially to establish the connection it needs to 

    function handleICECandidateEvent(e) {
        if (e.candidate) { // is e.candidate the current user / client 
            const payload = {
                target: otherUser.current,
                candidate: e.candidate, // this e.candidate is like a ICE config used to establish an RTCPeerConnection
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) { // incoming maybe whoever is calling 
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate) 
            .catch(e => console.log(e));
    } // one perspective is from the user you're calling, the other user. Adds this icecandidate to it's peerRef as a key value pair? 

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];

    }; // creating a video for the person you're calling? 



    //cuts connection when user leaves page
    useEffect(() => {
        return () => {
            stopStreamedVideo()
        }
    },[])

    

    const playStop = () => {
        let enabled = userVideo.current.srcObject.getVideoTracks()[0].enabled;
        if(enabled){
            userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
            // console.log('false', enabled)
            setVideo('Video On')
        }else{
            userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
            // console.log('true', enabled)
            setVideo('Video Off')
        }
    }

    const stopStreamedVideo = () => {
        const tracks = userStream.current.getTracks();

        //note - stream.stop() is deprecated. Do not use
        tracks.forEach(function(track) {
            track.stop();
            
        });
        testFeatures()
        
    }


    const muteStream = () => {
        const enabled = userVideo.current.srcObject.getAudioTracks()[0].enabled;
        if(enabled){
            userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
            setMute('Unmute')
           
        }else {
            userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
            setMute('Mute')

        }
    }
    
  
    // const hangUpButton = () => {
    //     onLeave();
    // }

    function onLeave() {
        userVideo.current.srcObject = null;
        partnerVideo.current.srcObject = null;
        peerRef.current.close();
        peerRef.current.onicecandidate = null;
        peerRef.current.onaddstream = null;
        createPeer()
    };

      const killIt = () => {
        peerRef.current.close()
    }

    const testFeatures = () => {
         // works but only if there is a peerRef (only if a connection has been established)
        if (peerRef.current){
            socketRef.current.emit("hangUp", otherUser.current)
            peerRef.current.close()

        }

    }
    
   
    
    return (
        <div className='room_container'>
            {/* button below now functions with leave meeting */}

            <div className="main">
                        <div className="video_titles">
                            <h1 className="title">{props.user}</h1>
                            <h1 className="title">{otherUserName.current}</h1>
                        </div>
                <div className="main_videos">
                    <div id="video-grid">
                        <div>
                            <video id="myVideo" autoPlay ref={userVideo} muted/>
                        </div>
                        <div>
                            <video autoPlay ref={partnerVideo} />
                        </div>
                    </div>
                </div>
                <div className="main_controls_container">
                    <div className='main_controls'>
                        <div>
                            <button onClick={() => muteStream()}>{mute}</button> 
                            <button onClick={() => playStop()}>{video}</button>  
                        </div>
                        <div>
                            <Link to='/'>
                                <button onClick={() => stopStreamedVideo()}>Leave Meeting</button>  
                            </Link>

                        </div>
                    </div>
                </div>   
            </div>

        </div>
    );
};

export default Room;