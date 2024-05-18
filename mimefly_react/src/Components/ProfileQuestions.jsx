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
import Question from "./Question";

export default function ProfileQuestions({ uid }) {
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
      const asker = await getDoc(doc(db, "users", uid)).catch((e) => {});

      const ref = collection(db, "questions");

      let questions = null;

      let q = null;

      if (lastDoc) {
        q = query(
          ref,
          where("uid", "==", uid),
          where("deleted", "==", false),
          where("direct", "==", false),
          orderBy("dateCreated", "desc"),
          startAfter(lastDoc),
          limit(10)
        );
      } else {
        q = query(
          ref,
          where("uid", "==", uid),
          where("deleted", "==", false),
          where("direct", "==", false),
          orderBy("dateCreated", "desc"),
          limit(10)
        );
      }

      questions = await getDocs(q);

      let p = [];

      if (questions.empty && page == 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLastDoc(questions.docs[questions.docs.length - 1]);

      for (let i = 0; i < questions.docs.length; i++) {
        let meta = await getDoc(
          doc(
            db,
            `questions/${questions.docs[i].id}/meta/${questions.docs[i].id}`
          )
        );

        p.push({
          askerUsername: asker.get("username"),
          askerName: asker.get("displayName"),
          askerPic: asker.get("profilePic"),
          dateCreated: {
            _seconds: questions.docs[i].get("dateCreated").seconds,
            _nanoseconds: questions.docs[i].get("dateCreated").nanoseconds,
          },
          questionText: questions.docs[i].get("questionText"),
          questionImage: questions.docs[i].get("questionImage"),
          questionId: questions.docs[i].id,
          questionDeleted: questions.docs[i].get("deleted"),
          answerCount: questions.docs[i].get("answerCount"),
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
          return (
            <Question
              embedded={false}
              questions={p}
              key={i}
              questionId={p.questionId}
            />
          );
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
