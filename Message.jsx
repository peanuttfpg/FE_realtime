import React, { useContext, useEffect, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import { AuthContext } from "../../../utils/AuthContext";
import { ChatContext } from "../../../utils/ChatContext";
import styles from "./chat.module.scss";
function Message({ message }) {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

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

  return (
    <div
      ref={ref}
      className={`${styles.chatMsg} ${
        message.senderID === currentUser.id && styles.owner
      }`}
    >
      <div className={styles.chatMsgProfile}>
        <img
          className={styles.chatMsgImg}
          src={
            message.senderID === currentUser.id
              ? currentUser.imageUrl
              : data.user.imageUrl
          }
          alt=""
        />
        <div className={styles.chatMsgDate}>
          {toDaysHoursMinutes(Timestamp.now() - message.date)}
        </div>
      </div>
      <div className={styles.chatMsgContent}>
        <div className={styles.chatMsgText}>{message.text}</div>
        {message.img && <img src={message.img} alt={message.text} />}
      </div>
    </div>
  );
}

export default Message;
