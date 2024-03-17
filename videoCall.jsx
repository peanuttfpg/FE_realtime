import React, { Component } from "react";
import io from "socket.io-client";
// import HeaderMeeting from "./headerMeeting";
import styles from "./chat.module.scss";
const server_url = "https://codeuapi.vercel.app";

var connections = {};
const peerConnectionConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
var socket = null;
var socketId = null;
var elms = 0;
const userLogin = localStorage.getItem("userLogin");
const user = userLogin ? JSON.parse(userLogin).username : "";
class VideoCall extends Component {
  constructor(props) {
    super(props);
    this.localVideoref = React.createRef();
    this.videoAvailable = false;
    this.audioAvailable = false;
    this.state = {
      video: false,
      audio: false,
      screen: false,
      showModal: false,
      screenAvailable: false,
      messages: [],
      message: "",
      newmessages: 0,
      askForUsername: true,
      username: user,
    };
    connections = {};
    this.getPermissions();
  }

  getPermissions = async () => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => (this.videoAvailable = true))
        .catch(() => (this.videoAvailable = false));
      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => (this.audioAvailable = true))
        .catch(() => (this.audioAvailable = false));
      if (navigator.mediaDevices.getDisplayMedia) {
        this.setState({ screenAvailable: true });
      } else {
        this.setState({ screenAvailable: false });
      }
      if (this.videoAvailable || this.audioAvailable) {
        navigator.mediaDevices
          .getUserMedia({
            video: this.videoAvailable,
            audio: this.audioAvailable,
          })
          .then((stream) => {
            window.localStream = stream;
            this.localVideoref.current.srcObject = stream;
          })
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    } catch (e) {
      console.log(e);
    }
  };

  getMedia = () => {
    this.setState(
      {
        video: this.videoAvailable,
        audio: this.audioAvailable,
      },
      () => {
        this.getUserMedia();
        this.connectToSocketServer();
      }
    );
  };

  getUserMedia = () => {
    if (
      (this.state.video && this.videoAvailable) ||
      (this.state.audio && this.audioAvailable)
    ) {
      navigator.mediaDevices
        .getUserMedia({ video: this.state.video, audio: this.state.audio })
        .then(this.getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = this.localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    this.localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);
      // eslint-disable-next-line
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          this.setState(
            {
              video: false,
              audio: false,
            },
            () => {
              try {
                let tracks = this.localVideoref.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
              } catch (e) {
                console.log(e);
              }
              let blackSilence = (...args) =>
                new MediaStream([this.black(...args), this.silence()]);
              window.localStream = blackSilence();
              this.localVideoref.current.srcObject = window.localStream;

              for (let id in connections) {
                connections[id].addStream(window.localStream);
                // eslint-disable-next-line
                connections[id].createOffer().then((description) => {
                  connections[id]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        id,
                        JSON.stringify({
                          sdp: connections[id].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                });
              }
            }
          );
        })
    );
  };

  getDislayMedia = () => {
    if (this.state.screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(this.getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    this.localVideoref.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketId) continue;
      connections[id].addStream(window.localStream);
      // eslint-disable-next-line
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          this.setState(
            {
              screen: false,
            },
            () => {
              try {
                let tracks = this.localVideoref.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
              } catch (e) {
                console.log(e);
              }

              let blackSilence = (...args) =>
                new MediaStream([this.black(...args), this.silence()]);
              window.localStream = blackSilence();
              this.localVideoref.current.srcObject = window.localStream;
              this.getUserMedia();
            }
          );
        })
    );
  };

  gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  changeCssVideos = (main) => {
    let widthMain = main.offsetWidth;
    let minWidth = "30%";
    if ((widthMain * 30) / 100 < 300) {
      minWidth = "300px";
    }
    let minHeight = "40%";

    let height = String(100 / elms) + "%";
    let width = "";
    if (elms === 0 || elms === 1) {
      width = "100%";
      height = "100%";
    } else if (elms === 2) {
      width = "45%";
      height = "100%";
    } else if (elms === 3 || elms === 4) {
      width = "35%";
      height = "50%";
    } else {
      width = String(100 / elms) + "%";
    }
    let videos = main.querySelectorAll("video");
    for (let a = 0; a < videos.length; ++a) {
      videos[a].style.minWidth = minWidth;
      videos[a].style.minHeight = minHeight;
      videos[a].style.setProperty("width", width);
      videos[a].style.setProperty("height", height);
    }
    return { minWidth, minHeight, width, height };
  };

  connectToSocketServer = () => {
    socket = io.connect(server_url, { secure: true });
    socket.on("signal", this.gotMessageFromServer);
    socket.on("connect", () => {
      socket.emit("join-call", window.location.href);
      socketId = socket.id;
      socket.on("chat-message", this.addMessage);
      socket.on("user-left", (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`);
        if (video !== null) {
          elms--;
          video.parentNode.removeChild(video);
          let main = document.getElementById("main");
          this.changeCssVideos(main);
        }
      });
      socket.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socket.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };
          connections[socketListId].onaddstream = (event) => {
            var searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            );
            if (searchVidep !== null) {
              searchVidep.srcObject = event.stream;
            } else {
              elms = clients.length;
              let main = document.getElementById("main");
              let cssMesure = this.changeCssVideos(main);
              let video = document.createElement("video");
              let css = {
                minWidth: cssMesure.minWidth,
                minHeight: cssMesure.minHeight,
                maxHeight: "100%",
                margin: "10px",
                borderRadius: "8px",
                boxShadow:
                  " 0px 1px 3px 0px rgb(60 64 67 / 30%), 0px 4px 8px 3px rgb(60 64 67 / 15%)",
                background: "#4A4E51",
                objectFit: "fill",
              };
              for (let i in css) video.style[i] = css[i];
              video.style.setProperty("width", cssMesure.width);
              video.style.setProperty("height", cssMesure.height);
              video.setAttribute("data-socket", socketListId);
              video.srcObject = event.stream;
              video.autoplay = true;
              video.playsinline = true;
              main.appendChild(video);
            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([this.black(...args), this.silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}
            // eslint-disable-next-line
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  handleVideo = () =>
    this.setState({ video: !this.state.video }, () => this.getUserMedia());
  handleAudio = () =>
    this.setState({ audio: !this.state.audio }, () => this.getUserMedia());
  handleScreen = () =>
    this.setState({ screen: !this.state.screen }, () => this.getDislayMedia());
  handleEndCall = () => {
    try {
      let tracks = this.localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.close();
  };

  openChat = () => this.setState({ showModal: !this.state.showModal });
  handleMessage = (e) => this.setState({ message: e.target.value });

  addMessage = (data, sender, socketIdSender) => {
    this.setState((prevState) => ({
      messages: [...prevState.messages, { sender: sender, data: data }],
    }));
    if (socketIdSender !== socketId) {
      this.setState({ newmessages: this.state.newmessages + 1 });
    }
  };
  // handleUsername = (e) => this.setState({ username: e.target.value });
  sendMessage = () => {
    socket.emit("chat-message", this.state.message, this.state.username);
    this.setState({ message: "", sender: this.state.username });
  };
  connect = () =>
    this.setState({ askForUsername: false }, () => this.getMedia());
  isChrome = function () {
    let userAgent = (navigator && (navigator.userAgent || "")).toLowerCase();
    let vendor = (navigator && (navigator.vendor || "")).toLowerCase();
    let matchChrome = /google inc/.test(vendor)
      ? userAgent.match(/(?:chrome|crios)\/(\d+)/)
      : null;
    return matchChrome !== null;
  };

  render() {
    if (this.isChrome() === false) {
      return <h1>Sorry...</h1>;
    }
    return (
      <div div style={{ background: "#18191A" }}>
        {this.state.askForUsername === true ? (
          <div
            onLoad={this.setState({ askForUsername: false }, () =>
              this.getMedia()
            )}
          >
            {/* <input
              type="text"
              placeholder="Username"
              value={this.state.username}
              onChange={(e) => this.handleUsername(e)}
            />
            <button
              
              style={{ margin: "20px" }}
            >
              Connect
            </button> */}
          </div>
        ) : (
          <>
            {/* <HeaderMeeting /> */}
            <div
              className={styles.btnDown}
              style={{
                backgroundColor: "#242526",
                color: "whitesmoke",
                textAlign: "center",
              }}
            >
              <button style={{ color: "#424242" }} onClick={this.handleVideo}>
                {this.state.video === true ? (
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0,0,256,256">
  <g fill="#ffffff" fillRule="nonzero" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit={10}>
    <g transform="scale(5.12,5.12)">
      <path d="M5,9c-2.80078,0 -5,2.19922 -5,5v22c0,2.80078 2.19922,5 5,5h27c2.80078,0 5,-2.19922 5,-5v-22c0,-2.80078 -2.19922,-5 -5,-5zM50,12.3125l-11,5.875v13.625l11,5.875z" />
    </g>
  </g>
</svg>

                ) : (
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50px"
                    height="50px"
                    viewBox="0,0,256,256"
                  >
                    <g fill="#ffffff">
                      <g transform="scale(5.12,5.12)">
                        <path d="M0.90625,-0.03125c-0.04297,0.00781 -0.08594,0.01953 -0.125,0.03125c-0.375,0.06641 -0.67578,0.33984 -0.78125,0.70313c-0.10547,0.36719 0.00391,0.75781 0.28125,1.01563l48,48c0.39844,0.39844 1.03906,0.39844 1.4375,0c0.39844,-0.39844 0.39844,-1.03906 0,-1.4375l-12.71875,-12.71875v-21.5625c0,-2.80078 -2.19922,-5 -5,-5h-21.5625l-8.71875,-8.71875c-0.20703,-0.22266 -0.50781,-0.33594 -0.8125,-0.3125zM5,9c-2.69922,0 -5,2.30078 -5,5v22c0,2.80078 2.19922,5 5,5h27c1.39844,0 2.60156,-0.60547 3.5,-1.40625zM50,12.3125l-11,5.9375v13.5l11,5.9375z"></path>
                      </g>
                    </g>
                  </svg>
                )}
              </button>
              <button style={{ color: "#f44336" }} onClick={this.handleEndCall}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  x="0"
                  y="0"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path
                      d="M511.948 277.335c-.414-7.399-3.303-14.672-8.668-20.315-66.029-69.438-153.852-107.688-247.291-107.688-93.428 0-181.251 38.25-247.27 107.688-5.365 5.643-8.254 12.916-8.668 20.314-.483 8.635 2.406 17.439 8.668 24.02l49.173 51.74c11.564 12.146 32.087 12.146 43.651 0 16.45-17.302 35.15-31.563 55.486-42.333 10.189-5.25 16.773-16.302 16.679-26.75l7.438-56.063c54.444-17.375 95.814-17.385 149.716-.01l7.334 54.667c0 11.823 6.272 22.615 16.523 28.25 20.44 10.823 39.14 25.083 55.601 42.375 5.782 6.094 13.533 9.438 21.826 9.438 8.282 0 16.033-3.344 21.815-9.427l49.319-51.875c6.262-6.588 9.151-15.395 8.668-24.031z"
                      fill="#000000"
                    ></path>
                  </g>
                </svg>
              </button>
              <button style={{ color: "#424242" }} onClick={this.handleAudio}>
                {this.state.audio === true ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    x="0"
                    y="0"
                    viewBox="0 0 330 330"
                  >
                    <g>
                      <path
                        d="M164.998 210c35.887 0 65.085-29.195 65.085-65.12l-.204-80c0-35.776-29.105-64.88-64.881-64.88-35.773 0-64.877 29.104-64.877 64.843l-.203 80.076c0 35.886 29.194 65.081 65.08 65.081z"
                        fill="#000000"
                      ></path>
                      <path
                        d="M280.084 154.96c0-8.285-6.717-15-15-15-8.284 0-15 6.715-15 15 0 46.732-37.878 84.773-84.546 85.067-.181-.007-.357-.027-.54-.027-.184 0-.359.02-.541.027-46.664-.293-84.541-38.335-84.541-85.067 0-8.285-6.717-15-15-15-8.284 0-15 6.715-15 15 0 58.372 43.688 106.731 100.082 114.104V300H117c-8.284 0-15 6.716-15 15s6.716 15 15 15h96.002c8.283 0 15-6.716 15-15s-6.717-15-15-15h-33.004v-30.936c56.397-7.374 100.086-55.732 100.086-114.104z"
                        fill="#000000"
                      ></path>
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    x="0"
                    y="0"
                    viewBox="0 0 512 512"
                  >
                    <g>
                      <path
                        d="M113.922 269.803c-2.856-11.419-4.283-22.172-4.283-32.26v-36.55c0-4.947-1.809-9.229-5.424-12.847-3.617-3.616-7.898-5.424-12.847-5.424-4.952 0-9.235 1.809-12.851 5.424-3.617 3.617-5.426 7.9-5.426 12.847v36.547c0 21.129 3.999 41.494 11.993 61.106l28.838-28.843zM237.545 328.897c25.126 0 46.638-8.946 64.521-26.83 17.891-17.884 26.837-39.399 26.837-64.525v-36.547L431.972 97.929c1.902-1.903 2.854-4.093 2.854-6.567s-.952-4.664-2.854-6.567l-23.407-23.413c-1.91-1.906-4.097-2.856-6.57-2.856-2.472 0-4.661.95-6.564 2.856L43.117 413.698c-1.903 1.902-2.852 4.093-2.852 6.563 0 2.478.949 4.668 2.852 6.57l23.411 23.411c1.904 1.903 4.095 2.851 6.567 2.851 2.475 0 4.665-.947 6.567-2.851l72.519-72.519c20.933 12.949 43.299 20.656 67.093 23.127v37.691h-73.089c-4.949 0-9.235 1.811-12.847 5.428-3.618 3.613-5.43 7.898-5.43 12.847 0 4.941 1.812 9.233 5.43 12.847 3.612 3.614 7.898 5.428 12.847 5.428h182.718c4.948 0 9.232-1.813 12.847-5.428 3.62-3.613 5.428-7.905 5.428-12.847 0-4.948-1.808-9.233-5.428-12.847-3.614-3.617-7.898-5.428-12.847-5.428h-73.087V400.85c41.302-4.565 75.988-22.408 104.067-53.526 28.072-31.117 42.11-67.711 42.11-109.776v-36.554c0-4.947-1.808-9.229-5.421-12.845-3.621-3.617-7.902-5.426-12.851-5.426-4.945 0-9.229 1.809-12.847 5.426-3.617 3.616-5.424 7.898-5.424 12.845v36.547c0 35.214-12.519 65.333-37.545 90.359s-55.151 37.544-90.362 37.544c-20.557 0-40.065-4.849-58.529-14.561l27.408-27.401c10.285 3.615 20.657 5.415 31.123 5.415zM290.223 16.849C274.518 5.618 256.959 0 237.545 0c-25.125 0-46.635 8.951-64.524 26.84-17.89 17.89-26.835 39.399-26.835 64.525v146.177L323.483 60.244c-6.475-17.701-17.556-32.167-33.26-43.395z"
                        fill="#000000"
                      ></path>
                    </g>
                  </svg>
                )}
              </button>
              {this.state.screenAvailable === true ? (
                <button
                  style={{ color: "#424242" }}
                  onClick={this.handleScreen}
                >
                  {this.state.screen === true ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="50"
                      x="0"
                      y="0"
                      viewBox="0 0 536.2 531.3"
                    >
                      <g>
                        <path
                          d="M438.6 392.5c23.5-.1 42.5-19.1 42.6-42.6V136.8c-.1-23.5-19.1-42.6-42.6-42.6h-341c-23.5.1-42.6 19.1-42.6 42.6v213.1c0 23.5 19.1 42.6 42.6 42.6h-64c-11.8.3-21.1 10-20.9 21.8.2 11.4 9.4 20.6 20.9 20.9h468.9c11.8-.3 21.1-10 20.9-21.8-.2-11.4-9.4-20.6-20.9-20.9zm-149.2-75.2v-46.7c-59.2 0-98.3 18.1-127.9 58 11.9-56.9 45-113.6 127.9-125.1v-45.4l76.9 71.6c4.3 4 4.5 10.8.4 15.1-.1.2-.3.3-.4.4z"
                          fill="#000000"
                        ></path>
                      </g>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="50"
                      x="0"
                      y="0"
                      viewBox="0 0 24 24"
                    >
                      <g>
                        <path
                          fill="#000000"
                          d="m21.79 18 2 2H24v-2zM1.11 2.98l1.55 1.56c-.41.37-.66.89-.66 1.48V16c0 1.1.9 2 2.01 2H0v2h18.13l2.71 2.71 1.41-1.41L2.52 1.57zM4 6.02h.13l4.95 4.93C7.94 12.07 7.31 13.52 7 15c.96-1.29 2.13-2.08 3.67-2.46l3.46 3.48H4zm16 0v10.19l1.3 1.3c.42-.37.7-.89.7-1.49v-10a2 2 0 0 0-2-2H7.8l2 2zm-7.07 3.13 2.79 2.78 1.28-1.2L13 7v2.13z"
                        ></path>
                      </g>
                    </svg>
                  )}
                </button>
              ) : null}
              {/* <span
                className="MuiBadge-root"
                color="secondary"
                onClick={this.openChat}
              >
                <button style={{ color: "#424242" }} onClick={this.openChat}>
                  <MdChat />
                </button>
                <span className="MuiBadge-anchor">
                  {this.state.newmessages}
                </span>
              </span> */}
            </div>
            <div className={styles.container}>
              <div
                id="main"
                className={styles.flexContainer}
                style={{ margin: 12, padding: 0 }}
              >
                <video
                  id="my-video"
                  ref={this.localVideoref}
                  autoPlay
                  muted
                  style={{
                    borderRadius: "8px",
                    boxShadow:
                      " 0px 1px 3px 0px rgb(60 64 67 / 30%), 0px 4px 8px 3px rgb(60 64 67 / 15%)",
                    background: "#4A4E51",
                    // margin: "10px",
                    objectFit: "fill",
                    width: "100%",
                    height: "100%",
                  }}
                ></video>
              </div>
              {/* {this.state.showModal && (
                <div className="chat-room">
                  <div style={{ flex: "1 1", overflow: "auto" }}>
                    <div>
                      <p>Message In Meet</p>
                    </div>
                    <div>
                      {this.state.messages.length > 0 ? (
                        this.state.messages.map((item, index) => (
                          <div key={index} style={{ textAlign: "left" }}>
                            <p style={{ wordBreak: "break-all" }}>
                              <b>{item.sender}</b>: {item.data}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No message yet</p>
                      )}
                    </div>
                  </div>
                  <div className="div-send-msg">
                    <input
                      placeholder=" Enter Message..."
                      value={this.state.message}
                      onChange={(e) => this.handleMessage(e)}
                    />
                    <button
                      variant="contained"
                      color="primary"
                      onClick={this.sendMessage}
                    >
                      <IoSend />
                    </button>
                  </div>
                </div>
              )} */}
            </div>
          </>
        )}
      </div>
    );
  }
}

export default VideoCall;
