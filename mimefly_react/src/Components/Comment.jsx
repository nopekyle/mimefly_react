import { Paper, Typography, Avatar } from "@mui/material";
import React from "react";
import { useHistory, Link } from "react-router-dom";
import moment from "moment";
import CommentButtons from "./CommentButtons";

function Comment(props) {
  const history = useHistory();

  let goToProfile = (username) => {
    history.push(username);
  };

  function formatDate(date) {
    const { _seconds, _nanoseconds } = date;
    let jsTimestamp = new Date(_seconds * 1000 + _nanoseconds / 1000000);

    // Format the JavaScript Date using moment
    const formattedTime = moment(jsTimestamp).fromNow();

    return formattedTime;
  }

  return (
    <div>
      <Paper
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "column",
          padding: 2,
          marginBottom: 2,
          marginTop: 2,
        }}
        elevation={1}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            marginLeft: "10px",
          }}
        >
          <Avatar src={props.data.profilePic} sx={{ marginRight: "10px" }} onClick={() => goToProfile(props.data.commenterUsername)} />

          <Typography style={{ color: "black", marginRight: "10px" }}>
            {props.data.displayName}
          </Typography>
          <Typography style={{ color: "gray", opacity: "80%" }}>
            @{props.data.commenterUsername}
          </Typography>
        </div>

        <div style={{ alignSelf: "flex-start", width: "100%" }}>
          <Typography sx={{ marginLeft: "10px", marginTop:'10px', marginBottom:'10px' }}>
            {props.data.commentText}
          </Typography>
        </div>
        <hr style={{ width: "100%" }}></hr>
        <Typography style={{ marginLeft: "10px" }}>
          {formatDate(props.data.dateCreated)}
        </Typography>
        <hr style={{ width: "100%" }}></hr>
        <div style={{ alignSelf:'flex-end'}}>
          <CommentButtons />
        </div>
      </Paper>
    </div>
  );
}

export default Comment;
