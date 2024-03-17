import { useContext, useState } from "react";
import {
  Timestamp,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { AuthContext } from "../../../utils/AuthContext";
import { ChatContext } from "../../../utils/ChatContext";
import { storage, db } from "../../../configs/firebase.configs";
import styles from "./chat.module.scss";
function MsgInput() {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());

      await uploadBytes(storageRef, img).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            await updateDoc(doc(db, "chats", data.chatID), {
              messages: arrayUnion({
                id: uuid(),
                text: text,
                senderID: currentUser.id,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          } catch (err) {
            // setErr(true);
            // setLoading(false);
          }
        });
      });
    } else {
      await updateDoc(doc(db, "chats", data.chatID), {
        messages: arrayUnion({
          id: uuid(),
          text: text,
          senderID: currentUser.id,
          date: Timestamp.now(),
        }),
      });
    }
    await updateDoc(doc(db, "userChats", currentUser.id), {
      [data.chatID + ".lastmessage"]: {
        text: text,
      },
      [data.chatID + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.id), {
      [data.chatID + ".lastmessage"]: {
        text: text,
      },
      [data.chatID + ".date"]: serverTimestamp(),
    });
    setText("");
    setImg(null);
  };

  const handleKey = (e) => {
    if ((e.code === "Enter" || e.code === "NumpadEnter") && text !== "") {
      handleSend();
    }
  };

  return (
    <div className={styles.chatAreaFooter}>
      <svg height="20px" viewBox="0 0 24 24" width="20px">
        <g fillRule="evenodd">
          <polygon fill="none" points="-6,30 30,30 30,-6 -6,-6 " />
          <path
            d="m18,11l-5,0l0,-5c0,-0.552 -0.448,-1 -1,-1c-0.5525,0 -1,0.448 -1,1l0,5l-5,0c-0.5525,0 -1,0.448 -1,1c0,0.552 0.4475,1 1,1l5,0l0,5c0,0.552 0.4475,1 1,1c0.552,0 1,-0.448 1,-1l0,-5l5,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1m-6,13c-6.6275,0 -12,-5.3725 -12,-12c0,-6.6275 5.3725,-12 12,-12c6.627,0 12,5.3725 12,12c0,6.6275 -5.373,12 -12,12"
            fill="#0084ff"
          />
        </g>
      </svg>
      <input
        type="text"
        name=""
        id=""
        placeholder="Enter Message..."
        onChange={(e) => setText(e.target.value)}
        value={text}
        onKeyDown={handleKey}
      />
      <div className="send">
        <input
          type="file"
          name=""
          id="imgAttachment"
          style={{ display: "none" }}
          onChange={(e) => setImg(e.target.files[0])}
          onKeyDown={handleKey}
        />
        {/* <label htmlFor="imgAttachment" className="imgAttachment">
          <ImAttachment size={20} />
        </label> */}
        <button onClick={handleSend} disabled={text === ""}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 512 512"
          >
            <g>
              <path
                fill="#41a5ee"
                d="M51.7 29.2c-38.8 0-63.8 41.3-45.7 75.7l66.2 125.6L294.3 256 72.2 281.6 6 407.2c-18.1 34.4 6.8 75.7 45.7 75.7 7 0 14-1.4 20.5-4.2l409.8-177c40-17.3 40-74 0-91.3L72.2 33.4c-6.5-2.8-13.5-4.2-20.5-4.2z"
              ></path>
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MsgInput;
