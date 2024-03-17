import { signOut } from "firebase/auth";
import { useContext } from "react";
import { AuthContext } from "../../../utils/AuthContext";
import { auth } from "../../../configs/firebase.configs";

function NavBar() {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="navbar">
      <span className="logo">FireChat</span>
      <div className="user">
        <img src={currentUser.imageUrl} alt={currentUser.username} />
        <span>{currentUser.username}</span>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>
    </div>
  );
}

export default NavBar;
