import {
  Container,
  CssBaseline,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Post from "./Post";
import "../firebase";

export default function AnswerPage() {
  const params = useParams();

  const db = getFirestore();
  const [a, setA] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    getAnswer();
  }, []);

  const getAnswer = async () => {
    try {
      const answer = await getDoc(doc(db, "answers", params.id));

      if (!answer.exists) {
        return setNotFound(true);
      }

      const meta = await getDoc(
        doc(db, `answers/${answer.id}/meta/${answer.id}`)
      );

      const user = await getDoc(doc(db, "users", answer.get("uid")));

      const question = await getDoc(
        doc(db, "questions", answer.get("questionId"))
      );

      const asker = await getDoc(doc(db, "users", question.get("uid")));

      setA({
        answerId: answer.id,
        answerText: answer.get("answerText"),
        answerImage: answer.get("answerImage"),
        answerDate: {
          _seconds: answer.get("dateCreated").seconds,
          _nanoseconds: answer.get("dateCreated").nanoseconds,
        },
        askerUsername: asker.get("username"),
        askerName: asker.get("displayName"),
        askerPic: asker.get("profilePic"),
        questionText: question.get("questionText"),
        questionImage: question.get("questionImage"),
        deleted: answer.get("deleted"),
        username: user.get("username"),
        userDisplayName: user.get("displayName"),
        profilePic: user.get("profilePic"),
        questionId: question.id,
        questionDate: {
          _seconds: question.get("dateCreated").seconds,
          _nanoseconds: question.get("dateCreated").nanoseconds,
        },
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  if (notFound) {
    return <div>404</div>;
  }

  if (loading) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={20} />
        </div>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Post data={a} key={a.answerId} embedded={true} alone={false} />
    </Container>
  );
}
