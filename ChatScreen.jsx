import React, { useContext } from "react";
import MessageScreen from "./MessageScreen";
import MsgInput from "./MsgInput";
import { ChatContext } from "../../../utils/ChatContext";
import styles from "./chat.module.scss";
function ChatScreen() {
  const { data } = useContext(ChatContext);

  return (
    <div className={styles.chatArea}>
      <div className={styles.chatAreaHeader}>
        <div className={styles.chatAreaTitle}>
          <img className={styles.chatMsgImg} src={data.user.imageUrl} alt="" />
          {data.user.username}
        </div>
      </div>
      <div className={styles.chatAreaMain}>
        <MessageScreen />
      </div>
      <MsgInput />
    </div>
  );
}

export default ChatScreen;
