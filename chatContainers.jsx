import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ChatInput from "./chatInput";
import styles from "./chat.module.scss";
import { Link } from "react-router-dom";

export default function ChatContainers({ currentChat, socket, isLogin }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(() => {
      async function setMess() {
        const response = await axios.post(
          `${import.meta.env.VITE_NODE_DOMAIN}/messages/getmsg`,
          {
            from: isLogin._id,
            to: currentChat._id,
          }
        );
        setMessages(response.data);
      }
      setMess();
    }, // eslint-disable-next-line
    [currentChat]
  );

  const handleSendMsg = async (msg) => {
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: isLogin._id,
      msg,
    });
    await axios.post(`${import.meta.env.VITE_NODE_DOMAIN}/messages/addmsg`, {
      from: isLogin._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(
    () => {
      if (socket.current) {
        socket.current.on("msg-recieve", (msg) => {
          setArrivalMessage({ fromSelf: false, message: msg });
        });
        // window.scrollTo({ top: 0 });
      }
    }, // eslint-disable-next-line
    []
  );

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className={styles.chatArea}>
      <div className={styles.chatAreaHeader}>
        <div className={styles.chatAreaTitle}>
          <img
            className={styles.chatMsgImg}
            src={currentChat.imageUrl}
            alt=""
          />{" "}
          {currentChat?.username}
        </div>
        <div className={styles.icon}>
          <svg height="34px" viewBox="-5 -5 30 30" width="34px">
            <path
              d="M10.952 14.044c.074.044.147.086.22.125a.842.842 0 001.161-.367c.096-.195.167-.185.337-.42.204-.283.552-.689.91-.772.341-.078.686-.105.92-.11.435-.01 1.118.174 1.926.648a15.9 15.9 0 011.713 1.147c.224.175.37.43.393.711.042.494-.034 1.318-.754 2.137-1.135 1.291-2.859 1.772-4.942 1.088a17.47 17.47 0 01-6.855-4.212 17.485 17.485 0 01-4.213-6.855c-.683-2.083-.202-3.808 1.09-4.942.818-.72 1.642-.796 2.136-.754.282.023.536.17.711.392.25.32.663.89 1.146 1.714.475.808.681 1.491.65 1.926-.024.31-.026.647-.112.921-.11.35-.488.705-.77.91-.236.17-.226.24-.42.336a.841.841 0 00-.368 1.161c.04.072.081.146.125.22a14.012 14.012 0 004.996 4.996z"
              fill="#0084ff"
            ></path>
            <path
              d="M10.952 14.044c.074.044.147.086.22.125a.842.842 0 001.161-.367c.096-.195.167-.185.337-.42.204-.283.552-.689.91-.772.341-.078.686-.105.92-.11.435-.01 1.118.174 1.926.648.824.484 1.394.898 1.713 1.147.224.175.37.43.393.711.042.494-.034 1.318-.754 2.137-1.135 1.291-2.859 1.772-4.942 1.088a17.47 17.47 0 01-6.855-4.212 17.485 17.485 0 01-4.213-6.855c-.683-2.083-.202-3.808 1.09-4.942.818-.72 1.642-.796 2.136-.754.282.023.536.17.711.392.25.32.663.89 1.146 1.714.475.808.681 1.491.65 1.926-.024.31-.026.647-.112.921-.11.35-.488.705-.77.91-.236.17-.226.24-.42.336a.841.841 0 00-.368 1.161c.04.072.081.146.125.22a14.012 14.012 0 004.996 4.996z"
              fill="none"
              stroke="#0084ff"
            ></path>
          </svg>
          <Link
            to={`http://127.0.0.1:5173/chat/${isLogin._id + currentChat._id}`}
            target="_blank"
            rel="noreferrer"
          >
            <svg height="34px" viewBox="-5 -5 30 30" width="34px">
              <path
                d="M19.492 4.112a.972.972 0 00-1.01.063l-3.052 2.12a.998.998 0 00-.43.822v5.766a1 1 0 00.43.823l3.051 2.12a.978.978 0 001.011.063.936.936 0 00.508-.829V4.94a.936.936 0 00-.508-.828zM10.996 18A3.008 3.008 0 0014 14.996V5.004A3.008 3.008 0 0010.996 2H3.004A3.008 3.008 0 000 5.004v9.992A3.008 3.008 0 003.004 18h7.992z"
                fill="#0084ff"
              ></path>
            </svg>
          </Link>
          <svg height="24px" viewBox="0 0 36 36" width="24px">
            <g transform="translate(18,18)scale(1.2)translate(-18,-18)">
              <path
                d="M18,10 C16.6195,10 15.5,11.119 15.5,12.5 C15.5,13.881 16.6195,15 18,15 C19.381,15 20.5,13.881 20.5,12.5 C20.5,11.119 19.381,10 18,10 Z M16,25 C16,25.552 16.448,26 17,26 L19,26 C19.552,26 20,25.552 20,25 L20,18 C20,17.448 19.552,17 19,17 L17,17 C16.448,17 16,17.448 16,18 L16,25 Z M18,30 C11.3725,30 6,24.6275 6,18 C6,11.3725 11.3725,6 18,6 C24.6275,6 30,11.3725 30,18 C30,24.6275 24.6275,30 18,30 Z"
                fill="#0084ff"
                stroke="#0084ff"
              ></path>
            </g>
          </svg>
        </div>
      </div>
      <div className={styles.chatAreaMain}>
        {messages.map((message) => {
          return (
            <div
              className={`${styles.chatMsg} ${
                message.fromSelf ? styles.owner : ""
              }`}
              ref={scrollRef}
              key={uuidv4()}
            >
              <div className={styles.chatMsgProfile}>
                {!message.fromSelf && (
                  <img
                    className={styles.chatMsgImg}
                    src={currentChat.imageUrl}
                    alt=""
                  />
                )}
                <div className={styles.chatMsgDate}>seen 2pm</div>
              </div>
              <div className={styles.chatMsgContent}>
                <div className={styles.chatMsgText}>{message.message}</div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </div>
  );
}
