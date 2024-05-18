import React, { useState, useEffect } from "react";
import { Paper, Avatar, Typography } from "@mui/material";
import moment from "moment";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

export default function Question(props) {
  const history = useHistory();

  const determineStupidThing = (num) => {
    if (num == 1) {
      return "1 answer";
    }
    return num.toString() + " answers";
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
          <Link
            to={
              !props.embedded
                ? `/${props.questions.askerUsername}`
                : `/${props.askerUsername}`
            }
          >
            <Avatar
              src={!props.embedded ? props.questions.askerPic : props.askerPic}
              sx={{ marginRight: "10px" }}
            />
          </Link>
          <Typography style={{ color: "black", marginRight: "10px" }}>
            {!props.embedded ? props.questions.askerName : props.askerName}
          </Typography>
          <Typography style={{ color: "gray", opacity: "80%" }}>
            @
            {!props.embedded
              ? props.questions.askerUsername
              : props.askerUsername}
          </Typography>
        </div>

        <div
          onClick={() =>
            history.push(`/q/${props.questions.questionId}`, {
              data: props,
              embedded: true,
              answers: [],
            })
          }
          style={{ alignSelf: "flex-start", width: "100%" }}
        >
          <Typography sx={{ marginLeft: "10px" }}>
            {!props.embedded
              ? props.questions.questionText
              : props.questionText}
          </Typography>
          {(
            !props.embedded
              ? props.questions.questionImage == ""
              : props.questionImage == ""
          ) ? (
            <div></div>
          ) : (
            <div
              style={{
                width: "100%",
                maxHeight: "500px",
                backgroundImage: !props.embedded
                  ? `url(${props.questions.questionImage})`
                  : `url(${props.questionImage})`,
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
          {formatDate(
            !props.embedded ? props.questions.dateCreated : props.dateCreated
          )}
        </Typography>
        <hr style={{ width: "100%" }}></hr>
        <Link
          to={{
            pathname: `/q/${
              !props.embedded ? props.questions.questionId : props.questionId
            }`,
            state: {
              data: props,
              embedded: false,
              answers: [],
            },
          }}
          style={{
            textDecoration: "none",
            padding: "0px",
            margin: "0px",
            color: "black",
          }}
        ></Link>
      </Paper>
    </div>
  );
}
