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
import Post from "./Post";

export default function ProfileAnswers({ uid }) {
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
      const answerer = await getDoc(doc(db, "users", uid)).catch((e) => {});

      const ref = collection(db, "answers");

      let answers = null;

      let q = null;

      if (lastDoc) {
        q = query(
          ref,
          where("uid", "==", uid),
          where("deleted", "==", false),
          orderBy("dateCreated", "desc"),
          startAfter(lastDoc),
          limit(10)
        );
      } else {
        q = query(
          ref,
          where("uid", "==", uid),
          where("deleted", "==", false),
          orderBy("dateCreated", "desc"),
          limit(10)
        );
      }

      answers = await getDocs(q);

      let qs = [];
      let p = [];
      let askers = [];
      let qid;
      if (answers.empty && page == 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLastDoc(answers.docs[answers.docs.length - 1]);

      for (let i = 0; i < answers.docs.length; i++) {
        let question = await getDoc(
          doc(db, "questions", answers.docs[i].get("questionId"))
        );
        qs.push({
          dateCreated: question.get("dateCreated"),
          questionId: question.id,
          questionDeleted: question.get("deleted"),
          questionText: question.get("questionText"),
          questionImage: question.get("questionImage"),
        });
        qid = question.get("uid");

        let asker = await getDoc(doc(db, "users", qid));
        askers.push(asker.data());
      }

      for (let i = 0; i < answers.docs.length; i++) {
        p.push({
          askerName: askers[i].displayName,
          profilePic: answerer.get("profilePic"),
          answererUsername: answerer.get("username"),
          userDisplayName: answerer.get("displayName"),
          questionDate: {
            _seconds: qs[i].dateCreated.seconds,
            _nanoseconds: qs[i].dateCreated.nanoseconds,
          },
          answerDate: {
            _seconds: answers.docs[i].get("dateCreated").seconds,
            _nanoseconds: answers.docs[i].get("dateCreated").nanoseconds,
          },
          askerPic: askers[i].profilePic,
          askerUsername: askers[i].username,
          questionText: qs[i].questionText,
          questionImage: qs[i].questionImage,
          questionId: qs[i].questionId,
          answerText: answers.docs[i].get("answerText"),
          answerImage: answers.docs[i].get("answerImage"),
          answerId: answers.docs[i].id,
          answerDeleted: answers.docs[i].get("deleted"),
          questionDeleted: qs[i].deleted,
          uid: askers[i].id,
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

  const check = isBlocked("2");

  return (
    <Container>
      <CssBaseline />
      <div>
        {posts.map((p, i) => {
          return <Post embedded={true} data={p} key={i} />;
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
