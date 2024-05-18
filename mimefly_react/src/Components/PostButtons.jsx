import React from "react";
import { IconButton } from "@mui/material";
import {
  FavoriteOutlined,
  ShareOutlined,
  ChatBubbleOutlineOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { useEffect } from "react";
export default function PostButtons({ answerId }) {
  const [isLiked, setLiked] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const checkIfLiked = async () => {
    const ref = doc(db, "likes", auth.currentUser.uid + answerId);
    const res = await getDoc(ref).catch((e) => {});

    if (
      res.get("answerId") == answerId &&
      res.get("uid") == auth.currentUser.uid
    ) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  };

  const likePost = async () => {
    const ans = await getDoc(doc(db, "answers", answerId));

    if (isLiked) {
      setLiked(false);
      // delete like
      deleteDoc(doc(db, "likes", auth.currentUser.uid + answerId));
    } else {
      setDoc(doc(db, "likes", auth.currentUser.uid + answerId), {
        uid: auth.currentUser.uid,
        answerId: answerId,
        dateCreated: serverTimestamp(),
      });
      // send noti

      const notiRef = collection(db, "notifications");
      addDoc(notiRef, {
        dateCreated: serverTimestamp(),
        from_uid: auth.currentUser.uid,
        to_uid: ans.get("uid"),
        postId: ans.id,
        type: "like",
      }).catch((e) => {});

      updateDoc(doc(db, "users_public", ans.get("uid")), {
        notificationsCount: increment(1),
      });
      setLiked(true);
    }
  };

  useEffect(() => {
    if (auth.currentUser == null) {
      return;
    } else {
      checkIfLiked();
    }
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <IconButton>
        <ShareOutlined />
      </IconButton>
      <IconButton>
        <ChatBubbleOutlineOutlined />
      </IconButton>
      <IconButton color={isLiked ? "error" : "default"} onClick={likePost}>
        <FavoriteOutlined />
      </IconButton>
    </div>
  );
}
