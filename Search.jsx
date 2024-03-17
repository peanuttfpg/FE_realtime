import { useContext, useState } from "react";

import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { AuthContext } from "../../../utils/AuthContext";
import { db } from "../../../configs/firebase.configs";
import { getTopCreators } from "../../../api/account";

function Search() {
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);
  // const { dispatch } = useContext(ChatContext);

  // Search Handler
  const handleSearch = async () => {
    // const q = query(
    //   collection(db, "users"),
    //   where("username", "==", userName)
    // );
    getTopCreators({ page: 1, pageSize: 1, userName }).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setUser(data.data[0]);
      }
    });
  };

  // KeyDown Handler
  const handleKey = (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      handleSearch();
    }
  };

  // Chat Select Action

  const handleSelect = async () => {
    // Existing Chat

    const combinedId =
      currentUser.id > user.id
        ? currentUser.id + user.id
        : user.id + currentUser.id;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        // create a chat session
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
        // create chats
        await updateDoc(doc(db, "userChats", currentUser.id), {
          [combinedId + ".userInfo"]: {
            id: user.id,
            username: user.username,
            imageUrl: user.profileResponse.imageUrl,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
                console.log("long");
        await updateDoc(doc(db, "userChats", user.id), {
          [combinedId + ".userInfo"]: {
            id: currentUser.id,
            username: currentUser.username,
            imageUrl: currentUser.imageUrl,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (error) {
      setError(error.message);
    }
    setUser(null);
    setUserName("");
    //  Create New
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          name=""
          id=""
          placeholder="Search Users....."
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
          onKeyDown={handleKey}
        />
      </div>
      {error && <span>User Not Found</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.profileResponse.imageUrl} alt={user.username} />
          <div className="userChatInfo">
            <span>{user.username}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
