import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Contacts from "./contacts";
import ChatContainers from "./chatContainers";
import { useIsLogin } from "../../../hooks/useIsLogin";
import styles from "./chat.module.scss";
import ChatScreen from "./ChatScreen";
import SideBar from "./SideBar";
import Chats from "./Chats";
import Search from "./Search";
function ChatBox() {
  // const navigate = useNavigate();
  // const socket = useRef();
  const { profileResponse } = useIsLogin();
  // const [contacts, setContacts] = useState([]);
  // const [_id, setId] = useState(false);
  // const [currentChat, setCurrentChat] = useState(undefined);
  // useEffect(() => {
  //   if (isLogin) {
      
  //   }
  // }, [isLogin]);

  // useEffect(() => {
  //   async function setCont(){
  //     if (isLogin) {
  //       if (isLogin) {
  //         const data = await axios.get(
  //           `${import.meta.env.VITE_NODE_DOMAIN}/account?ne=${isLogin.id}`
  //         );
  //         setContacts(data.data.list);
  //       } else {
  //         // navigate("/setAvatar");
  //       }
  //     }
  //   }
  //   async function setAccountById(){
  //     if (isLogin) {
  //       if (isLogin) {
  //         const data = await axios.get(
  //           `${import.meta.env.VITE_NODE_DOMAIN}/accountById?id=${isLogin.id}`
  //         );
  //         setId(data.data.data._id);
  //         socket.current = io("https://codeuapi.vercel.app");
  //         socket.current.emit("add-user", data.data.data._id);
  //       } else {
  //         // navigate("/setAvatar");
  //       }
  //     }
  //   }
  //   setCont();
  //   setAccountById();
  //   }, // eslint-disable-next-line
  //   [isLogin]
  // );
  // const handleChatChange = (chat) => {
  //   setCurrentChat(chat);
  // };
  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.logo}>Chat</div>
        {/* <div className={styles.searchBar}>
          <input type="text" placeholder="Search..." />
        </div> */}
        {/* <div className={styles.userSettings}>
          <div className={styles.settings}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={12} cy={12} r={3} />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
        </div> */}
      </div>
      <div className={styles.wrapper}>
        {/* <Search /> */}
        <Chats />
        <ChatScreen />
        {/* {isLogin.id && (
          <Contacts contacts={contacts} changeChat={handleChatChange} />
        )}
        {currentChat && _id && (
          <ChatContainers
            currentChat={currentChat}
            socket={socket}
            isLogin={{ _id }}
          />
        )} */}
        {/* <div className={styles.detailArea}>
          <div className={styles.detailAreaHeader}>
            <div className={`${styles.msgProfile} ${styles.group}`}>
              <img
                className={styles.chatMsgImg}
                src="https://lh3.googleusercontent.com/a/ACg8ocLXyIFAX531FhXbdF9Zv46pjLu7wLvcH2VCtjF0_1nsBhw=s96-c"
                alt=""
              />
            </div>
            <div className={styles.detailTitle}>username</div>
            <div className={styles.detailSubtitle}>username</div>
            <div className={styles.detailButtons}>
              <button className={styles.detailButton}>
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth={0}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call Chat
              </button>
              <button className={styles.detailButton}>
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth={0}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x={1} y={5} width={15} height={14} rx={2} ry={2} />
                </svg>
                Video Chat
              </button>
            </div>
          </div>
          <div className={styles.detailChanges}>
            <input type="text" placeholder="Search in Conversation" />
            <div className={styles.detailChange}>
              Change Emoji
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
            </div>
          </div>
          <div className={styles.detailPhotos}>
            <div className={styles.detailPhotoTitle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              Shared photos
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default ChatBox;
