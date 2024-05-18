import React, { useRef, useState, useEffect } from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { Paper, Avatar, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  onSnapshot,
  where,
  collection,
  query,
  limit,
  getDocs,
  doc,
  orderBy,
  getDoc,
} from "firebase/firestore";

function Notifications() {
  const auth = getAuth();
  const db = getFirestore();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      const ref = collection(db, "notifications");
      const q = query(
        ref,
        where("to_uid", "==", auth.currentUser.uid),
        orderBy("dateCreated", "desc"),
        limit(30)
      );

      const d = await getDocs(q);

      const promises = d.docs.map(async (s) => {
        let u = await getDoc(doc(db, "users", s.get("from_uid")));
        return {
          displayName: u.get("displayName"),
          profilePic: u.get("profilePic"),
          uid: u.id,
          dateCreated: s.get("dateCreated"),
          type: s.get("type"),
          postId: s.get("postId"),
        };
      });

      const notifications = await Promise.all(promises);
      setNotifications(notifications);
    } catch (e) {}
  };

  function buildNotifications(index, notifications) {
    if (notifications.type == "answer") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/a/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " answered your question"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "comment") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/c/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " commented on your answer"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "follow") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " followed you"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "comment_like") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/c/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " liked your comment"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "mention_question") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/q/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " mentioned you in a question"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "mention_answer") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/a/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " mentioned you in an answer"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "mention_comment") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/c/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " mentioned you in a comment"}
            </Typography>
          </div>
        </Paper>
      );
    } else if (notifications.type == "comment_reply") {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/a/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " replied to your comment"}
            </Typography>
          </div>
        </Paper>
      );
    } else {
      return (
        <Paper
          style={{ padding: "10px", marginTop: "10px", marginBottom: "10px" }}
          onClick={() => history.push(`/a/${notifications.postId}`)}
        >
          <div>
            <Avatar src={`${notifications.profilePic}`}></Avatar>
            <Typography>
              {notifications.displayName + " liked your answer"}
            </Typography>
          </div>
        </Paper>
      );
    }
  }

  const history = useHistory();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div>
        {notifications.map((n, i) => {
          return buildNotifications(i, n);
        })}
        <div style={{ height: "40px" }}></div>
      </div>
    </Container>
  );
}

export default Notifications;
