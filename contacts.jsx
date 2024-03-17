import React, { useState } from "react";
import styles from "./chat.module.scss";
export default function Contacts({ contacts, changeChat }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <div className={styles.conversationArea}>
      {contacts.map((contact, index) => {
        return (
          <div
            key={contact._id}
            className={`${styles.msg} ${
              index === currentSelected ? styles.online : ""
            }`}
            onClick={() => changeCurrentChat(index, contact)}
          >
            <img className={styles.msgProfile} src={contact.imageUrl} alt="" />
            <div className={styles.msgDetail}>
              <div className={styles.msgUsername}>{contact.username}</div>
              {/* <div className={styles.msgContent}>
                <span className={styles.msgMessage}>
                  What time was our meet
                </span>
                <span className={styles.msgDate}>20m</span>
              </div> */}
            </div>
          </div>
        );
      })}
    </div>
  );
}