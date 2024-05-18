import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Paper, Typography, Avatar, Divider } from "@mui/material";
import { auth } from "../firebase";
import moment from "moment";
import PostButtons from "./PostButtons";

function Post(props) {
  const history = useHistory();

  let goToProfile = (username) => {
    history.push(`/${username}`);
  };

  function formatDate(date) {
    const { _seconds, _nanoseconds } = date;
    let jsTimestamp = new Date(_seconds * 1000 + _nanoseconds / 1000000);

    // Format the JavaScript Date using moment
    const formattedTime = moment(jsTimestamp).fromNow();

    return formattedTime;
  }

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 2,
        marginBottom: 2,
        marginTop: 2,
        flexWrap: "wrap",
      }}
      elevation={2}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          src={props.data.profilePic}
          sx={{ marginRight: "10px" }}
          onClick={() => goToProfile(props.data.answererUsername)}
        />
        <Typography style={{ color: "black", marginRight: "10px" }}>
          {props.data.userDisplayName}
        </Typography>
        <Typography
          style={{ color: "gray", opacity: "80%", marginRight: "10px" }}
        >
          @{props.data.answererUsername}
        </Typography>
        <Typography>{formatDate(props.data.answerDate)}</Typography>
      </div>
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 2,
          marginBottom: 2,
          marginTop: 2,
          marginLeft: 2,
        }}
        elevation={1}
      >
        {props.data.questionDeleted ? (
          <div></div>
        ) : (
          <div
            className="row"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <Avatar
              src={props.data.askerPic}
              sx={{ marginRight: 2 }}
              onClick={() => goToProfile(props.data.askerUsername)}
            />
            <Typography style={{ color: "black", marginRight: "10px" }}>
              {props.data.askerName}
            </Typography>
            <Typography
              style={{ color: "gray", opacity: "80%", marginRight: "10px" }}
            >
              @{props.data.askerUsername}
            </Typography>
            <Typography>{formatDate(props.data.questionDate)}</Typography>
          </div>
        )}
        <Divider
          style={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}
        />

        <div
          onClick={() =>
            history.push(`/q/${props.data.questionId}`, {
              questions: props,
              embedded: false,
            })
          }
          style={{ alignSelf: "flex-start", width: "100%" }}
        >
          <Typography>{props.data.questionText}</Typography>
          {props.data.questionImage === "" ? (
            <div></div>
          ) : (
            <div
              style={{
                width: "100%",
                maxHeight: "500px",
                backgroundImage: `url(${props.data.questionImage})`,
                height: "300px",
                backgroundSize: "cover",
                borderRadius: "4px",
              }}
            ></div>
          )}
        </div>
      </Paper>
      <div
        onClick={() =>
          history.push(`/a/${props.data.answerId}`, {
            answers: props.data,
            alone: false,
          })
        }
      >
        <Typography>{props.data.answerText}</Typography>
        {props.data.answerImage === "" ? (
          <div></div>
        ) : (
          <div
            style={{
              width: "100%",
              maxHeight: "500px",
              backgroundImage: `url(${props.data.answerImage})`,
              height: "300px",
              backgroundSize: "cover",
              borderRadius: "4px",
            }}
          ></div>
        )}
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
      </div>
      <PostButtons answerId={props.data.answerId} />
    </Paper>
  );
}

export default Post;
