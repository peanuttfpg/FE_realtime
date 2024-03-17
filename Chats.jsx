import React, { useContext, useEffect, useState } from "react";
import { Timestamp, doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../../../utils/AuthContext";
import { ChatContext } from "../../../utils/ChatContext";
import { db } from "../../../configs/firebase.configs";
import styles from "./chat.module.scss";
function Chats() {
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const [chats, setChats] = useState([]);
  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.id), (doc) => {
        setChats(doc.data());
      });
      return () => {
        unsub();
      };
    };

    currentUser.id && getChats();
  }, [currentUser.id]);
  const toDaysHoursMinutes = (totalSeconds) => {
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = Math.floor(totalSeconds % 60);

    if (days !== 0) {
      return `${days} Days Ago`;
    } else if (days === 0 && hours !== 0) {
      return `${hours} Hours Ago`;
    } else if (days === 0 && hours === 0 && minutes !== 0) {
      return `${minutes} Minutes Ago`;
    } else if (days === 0 && hours === 0 && minutes === 0 && seconds !== 0) {
      return `${seconds} Seconds Ago`;
    } else {
      return "Just now";
    }
  };
  const handleSelect = (user) => {
    dispatch({ type: "CHANGE_USER", payload: user });
  };
  return (
    <div className={styles.conversationArea}>
      {chats &&
        Object.entries(chats)
          ?.sort((a, b) => b[1].date - a[1].date)
          .map((chat) => (
            <div
              className={styles.msg}
              key={chat[0]}
              onClick={() => handleSelect(chat[1].userInfo)}
            >
              <img
                className={styles.msgProfile}
                src={chat[1].userInfo.imageUrl}
                alt=""
              />
              <div className={styles.msgDetail}>
                <div className={styles.msgUsername}>
                  {chat[1].userInfo.username}
                </div>
                <div className={styles.msgContent}>
                  <span className={styles.msgMessage}>
                    {chat[1].lastmessage?.text}
                  </span>
                  <span className={styles.msgDate}>
                    {" "}
                    {toDaysHoursMinutes(Timestamp.now() - chat[1].date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
}

export default Chats;
