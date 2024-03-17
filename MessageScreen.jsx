import { useEffect, useContext, useState } from "react";
import Message from "./Message";
import { doc, onSnapshot } from "firebase/firestore";
import { ChatContext } from "../../../utils/ChatContext";
import { db } from "../../../configs/firebase.configs";

function MessageScreen() {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unSub = onSnapshot(doc(db, "chats", data.chatID), (doc) => {
        doc.exists() && setMessages(doc.data().messages);
      });

      return () => {
        unSub();
      };
    };
    data.chatID && getChats();
  }, [data.chatID]);

  return (
    <div>
      {messages.map((msg) => (
        <Message message={msg} key={msg.id} />
      ))}
    </div>
  );
}

export default MessageScreen;
