import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, firestore } from "./firebase";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
// Create a context
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const [inbox, setInbox] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [uid, setUID] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        setUID(user.uid);
        getUser(user);
      } else {
        setLoggedIn(false);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUser = async (user) => {
    const db = firestore;
    
    const unsubUser = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      setAvatar(doc.get("profilePic"));
      setUsername(doc.get("username_lowercase"));
    });

    const unsubUserPublic = onSnapshot(
      doc(db, "users_public", auth.currentUser.uid),
      (doc) => {
        setNotifications(doc.get("notificationsCount"));
        setInbox(doc.get("inboxCount"));
      }
    );
    return () => {
      // Unsubscribe from the snapshot listeners when the component unmounts
      unsubUser();
      unsubUserPublic();
    };
  };

  return (
    <AuthContext.Provider
      value={{ loggedIn, username, isLoading, avatar, inbox, notifications, uid }}
    >
      {children}
    </AuthContext.Provider>
  );
}
