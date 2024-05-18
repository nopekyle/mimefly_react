import { CircularProgress, Container, CssBaseline } from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import { isBlocked } from "../utils/CheckBlocks";
import Comment from "./Comment";

export default function ProfileComments({ uid }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  window.onscroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight &&
      !loadingMore
    ) {
      setPage((prevPage) => prevPage + 1);
      setLoadingMore(true);
    }
  };
  const db = getFirestore();
  const sentinelRef = useRef(null);

  const fetch = async () => {
    try {
      const commenter = await getDoc(doc(db, "users", uid)).catch((e) => {});

      const ref = collection(db, "comments");

      let comments = null;

      let c = null;

      if (lastDoc) {
        c = query(
          ref,
          where("uid", "==", uid),
          where("deleted", "==", false),
          orderBy("dateCreated", "desc"),
          startAfter(lastDoc),
          limit(10)
        );
      } else {
        c = query(
          ref,
          where("uid", "==", uid),
          where("deleted", "==", false),
          orderBy("dateCreated", "desc"),
          limit(10)
        );
      }

      comments = await getDocs(c);

      let p = [];

      if (comments.empty && page == 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLastDoc(comments.docs[comments.docs.length - 1]);

      for (let i = 0; i < comments.docs.length; i++) {
        let meta = await getDoc(
          doc(db, `comments/${comments.docs[i].id}/meta/${comments.docs[i].id}`)
        );

        p.push({
          commenterUsername: commenter.get("username"),
          displayName: commenter.get("displayName"),
          profilePic: commenter.get("profilePic"),
          dateCreated: {
            _seconds: comments.docs[i].get("dateCreated").seconds,
            _nanoseconds: comments.docs[i].get("dateCreated").nanoseconds,
          },
          commentText: comments.docs[i].get("commentText"),
          commentId: comments.docs[i].id,
          commentDeleted: comments.docs[i].get("deleted"),
          likes: meta.get("likes"),
          replies: meta.get("replies"),
        });
      }

      setPosts((prevPosts) => [...prevPosts, ...p]);
      setLoadingMore(false);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // When `uid` changes, reset the page and the data
    setPage(0);
    setPosts([]);
    setLastDoc(null);
    setLoadingMore(false);
    // Fetch data
    fetch();
    window.scrollTo(0, 0, "smooth");
  }, [uid]);

  useEffect(() => {
    if (loading) {
      return;
    }
    setLoading(true);
    setLoadingMore(true);
    fetch();
  }, [page]);

  return (
    <Container>
      <CssBaseline />
      <div>
        {posts.map((p, i) => {
          return <Comment data={p} key={i} />;
        })}
        <div ref={sentinelRef} id="sentinel" style={{ height: "40px" }}></div>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={20} />
          </div>
        )}
      </div>
    </Container>
  );
}
