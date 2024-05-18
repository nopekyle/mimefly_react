import React from "react";
import { Paper, Avatar, Typography } from "@mui/material";
import moment from "moment";
import { Link, useHistory } from "react-router-dom";

export default function Answer({ a }) {
  const history = useHistory();

  const determineStupidThing = (num) => {
    if (num == 1) {
      return "1 comment";
    }
    return num.toString() + " comments";
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
          <Link to={`/${a.username}`}>
            <Avatar src={a.profilePic} sx={{ marginRight: "10px" }} />
          </Link>
          <Typography style={{ color: "black", marginRight: "10px" }}>
            {a.displayName}
          </Typography>
          <Typography style={{ color: "gray", opacity: "80%" }}>
            @{a.username}
          </Typography>
        </div>

        <div
          onClick={() => history.push(`/a/${a.answerId}`, { data: a })}
          style={{ alignSelf: "flex-start", width: "100%" }}
        >
          <Typography sx={{ marginLeft: "10px" }}>{a.answerText}</Typography>
          {a.answerImage == "" ? (
            <div></div>
          ) : (
            <div
              style={{
                width: "100%",
                maxHeight: "500px",
                backgroundImage: `url(${a.answerImage})`,
                height: "300px",
                backgroundSize: "cover",
                borderRadius: "4px",
                marginLeft: "10px",
              }}
            ></div>
          )}
        </div>
        <hr style={{ width: "100%" }}></hr>
        <Typography style={{ marginLeft: "10px" }}>
          {formatDate(a.dateCreated)}
        </Typography>
        <hr style={{ width: "100%" }}></hr>
        <Typography style={{ marginLeft: "10px" }}>
          {!a.comments ? <div></div> : determineStupidThing(a.comments)}
        </Typography>
      </Paper>
    </div>
  );
}
