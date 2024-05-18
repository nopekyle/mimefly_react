import React, { useRef, useState, useEffect } from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Question from "./Question";
import { auth } from "../firebase";
import { CircularProgress } from "@mui/material";
import axios from "axios";

function Inbox() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState();
  const [nano, setNano] = useState();
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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

  useEffect(() => {
    if (loading) {
      return;
    }
    setLoading(true);
    setLoadingMore(true);
    getMore();
  }, [page]);

  const sentinelRef = useRef(null);

  const getInbox = async () => {
    const res = await axios
      .get(
        `https://us-central1-mimefly-qa.cloudfunctions.net/app/inbox/${auth.currentUser.uid}`
      )
      .catch((e) => {});

    let qns = [];

    // get the questions and asker
    for (let i = 0; i < res.data.length; i++) {
      qns.push({
        askerUsername: res.data[i].askerUsername,
        askerPic: res.data[i].profilePic,
        questionText: res.data[i].questionText,
        questionImage: res.data[i].questionImage,
        dateCreated: res.data[i].dateCreated,
        questionId: res.data[i].questionId,
        askerName: res.data[i].displayName,
      });
    }

    setQuestions(qns);
    setSeconds(qns[qns.length - 1].dateCreated._seconds);
    setNano(qns[qns.length - 1].dateCreated._nanoseconds);
    setLoading(false);
  };

  const getMore = async () => {
    setLoading(true);
    setLoadingMore(true);
    const res = await axios
      .get(
        `https://us-central1-mimefly-qa.cloudfunctions.net/app/moreInbox/${auth.currentUser.uid}?seconds=${seconds}&nanoseconds=${nano}`
      )
      .catch((e) => {});

    let qns = [];

    if(res.data.length == 0){
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    // get the questions and asker
    for (let i = 0; i < res.data.length; i++) {
      qns.push({
        askerUsername: res.data[i].askerUsername,
        askerPic: res.data[i].profilePic,
        questionText: res.data[i].questionText,
        questionImage: res.data[i].questionImage,
        dateCreated: res.data[i].dateCreated,
        questionId: res.data[i].questionId,
        askerName: res.data[i].displayName,
      });
    }

    setQuestions((prev) => [...prev, ...qns]);
    setSeconds(qns[qns.length - 1].dateCreated._seconds);
    setNano(qns[qns.length - 1].dateCreated._nanoseconds);
    setLoadingMore(false);
    setLoading(false);
  };

  useEffect(() => {
    getInbox();
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      {questions.map((q, i) => {
        return (
          <Question
            embedded={false}
            questions={q}
            questionId={q.questionId}
            key={i}
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
    </Container>
  );
}

export default Inbox;
