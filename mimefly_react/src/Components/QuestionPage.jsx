import React, { useState, useEffect } from "react";
import Question from "./Question";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getFirestore,
  getDoc,
  doc,
  startAfter,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import {
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Typography,
} from "@mui/material";
import { TextField, Grid, IconButton, Snackbar } from "@mui/material";
import { GifBoxOutlined, Image, Send } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { auth, storage } from "../firebase";
import Answer from "./Answer";

function QuestionPage() {
  const [file, setFile] = useState(null);
  const [gif, setGif] = useState(null);
  const [searching, setSearching] = useState(false);
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const { loggedIn, uid } = useAuth();
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState({});
  const [pickedImage, setPickedImage] = useState(null);
  const db = getFirestore();
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

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
    if (!hasMore) {
      return;
    }
    loadMore();
  }, [page]);

  const handleClose = (event, reason) => {
    setOpen(false);
  };

  const loadMore = async () => {
    try {
      const ref = collection(db, "answers");

      if (!lastDoc) {
        return;
      }

      setLoadingMore(true);

      const q = query(
        ref,
        where("questionId", "==", id),
        orderBy("dateCreated", "desc"),
        limit(10),
        startAfter(lastDoc)
      );

      const docs = await getDocs(q);

      if (docs.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      if (!docs.empty) {
        setLastDoc(docs.docs[docs.docs.length - 1]);
      }

      const answerIds = docs.docs.map((doc) => doc.id);

      let res = await getDoc(doc(db, "questions", id));

      let qu = await getDoc(doc(db, "users", res.get("uid")));

      let qs = {
        embedded: false,
        askerUsername: qu.get("username"),
        askerPic: qu.get("profilePic"),
        askerName: qu.get("displayName"),
        questionId: res.id,
        questionText: res.get("questionText"),
        questionImage: res.get("questionImage"),
        dateCreated: {
          _seconds: res.get("dateCreated").seconds,
          _nanoseconds: res.get("dateCreated").nanoseconds,
        },
      };

      setQuestion(qs);

      let ans = [];

      for (let i = 0; i < answerIds.length; i++) {
        let a = await getDoc(doc(db, "answers", answerIds[i]));
        let meta = await getDoc(
          doc(db, `answers/${answerIds[i]}/meta/${answerIds[i]}`)
        );
        let u = await getDoc(doc(db, "users", a.get("uid")));
        ans.push({
          username: u.get("username"),
          displayName: u.get("displayName"),
          profilePic: u.get("profilePic"),
          answerText: a.get("answerText"),
          answerId: a.id,
          answerImage: a.get("answerImage"),
          dateCreated: {
            _seconds: a.get("dateCreated").seconds,
            _nanoseconds: a.get("dateCreated").nanoseconds,
          },
          comments: meta.get("comments"),
        });
      }
      setAnswers((prev) => [...prev, ...ans]);
      setLoadingMore(false);
    } catch (e) {
      setLoadingMore(false);
    }
  };

  const getData = async () => {
    try {
      const ref = collection(db, "answers");

      const q = query(
        ref,
        where("questionId", "==", id),
        orderBy("dateCreated", "desc"),
        limit(10)
      );

      const docs = await getDocs(q);

      if (!docs.empty) {
        setLastDoc(docs.docs[docs.docs.length - 1]);
      }

      const answerIds = docs.docs.map((doc) => doc.id);

      let res = await getDoc(doc(db, "questions", id));

      let qu = await getDoc(doc(db, "users", res.get("uid")));

      let qs = {
        embedded: false,
        askerUsername: qu.get("username"),
        askerPic: qu.get("profilePic"),
        askerName: qu.get("displayName"),
        questionId: res.id,
        questionText: res.get("questionText"),
        questionImage: res.get("questionImage"),
        dateCreated: {
          _seconds: res.get("dateCreated").seconds,
          _nanoseconds: res.get("dateCreated").nanoseconds,
        },
      };

      setQuestion(qs);

      let ans = [];

      for (let i = 0; i < answerIds.length; i++) {
        let a = await getDoc(doc(db, "answers", answerIds[i]));
        let meta = await getDoc(
          doc(db, `answers/${answerIds[i]}/meta/${answerIds[i]}`)
        );
        let u = await getDoc(doc(db, "users", a.get("uid")));
        ans.push({
          username: u.get("username"),
          displayName: u.get("displayName"),
          profilePic: u.get("profilePic"),
          answerText: a.get("answerText"),
          answerId: a.id,
          answerImage: a.get("answerImage"),
          dateCreated: {
            _seconds: a.get("dateCreated").seconds,
            _nanoseconds: a.get("dateCreated").nanoseconds,
          },
          comments: meta.get("comments"),
        });
      }
      setAnswers(ans);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xs" component="main">
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

  const getGifs = async () => {
    setFile(null);
    const response = await axios
      .get("https://api.tenor.com/v1/trending?key=48EM9O1465VZ&limit=10")
      .catch((e) => {});

    let r = [];
    for (let i = 0; i < response.data.results.length; i++) {
      r.push(response.data.results[i].media[0].tinygif.url);
    }
    setSearching(true);
    setResults(r);
  };

  const handleSearch = async (event) => {
    if (event.target.value == "") {
      setSearching(false);
      setResults([]);
      return;
    }
    setSearching(true);
    const response = await axios
      .get(
        `https://api.tenor.com/v1/search?q=${event.target.value}&key=48EM9O1465VZ&limit=20`
      )
      .catch((e) => {});

    let r = [];
    for (let i = 0; i < response.data.results.length; i++) {
      r.push(response.data.results[i].media[0].tinygif.url);
    }
    setResults(r);
  };

  const handleImageSelection = (event) => {
    const selectedFile = URL.createObjectURL(event.target.files[0]);
    setFile(selectedFile);
    setPickedImage(event.target.files[0]);
    setGif(null); // Clear the GIF when selecting an image
    setSearching(false);
  };

  const handleGifSelection = (result) => {
    setGif(result);
    setFile(null); // Clear the image when selecting a GIF
    setSearching(false);
  };

  const handleCloseSelection = () => {
    setFile(null);
    setGif(null);
    setSearching(false);
  };

  const sendPost = async () => {
    if (text.trim() == "") {
      return;
    }

    const ques = await getDoc(doc(db, "questions", id));

    if (gif != null) {
      setSending(true);
      const reference = collection(db, "answers");

      const ans = await addDoc(reference, {
        answerImage: gif,
        answerText: text,
        dateCreated: serverTimestamp(),
        uid: auth.currentUser.uid,
        deleted: false,
        questionId: id,
        likes: 0,
        comments: 0,
      }).catch((e) => {
        setSending(false);
      });

      // notify asker
      const notiRef = collection(db, "notifications");
      addDoc(notiRef, {
        dateCreated: serverTimestamp(),
        from_uid: auth.currentUser.uid,
        to_uid: ques.get("uid"),
        postId: ans.id,
        type: "answer",
      }).catch((e) => {});

      updateDoc(doc(db, "users_public", ques.get("uid")), {
        notificationsCount: increment(1),
      });

      const followRef = collection(db, "following");

      const timelineRef = collection(db, "timeline");

      const q = query(
        followRef,
        where("userFollowingId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q).catch((e) => {});

      snap.docs.forEach((s) => {
        addDoc(timelineRef, {
          to_uid: s.get("uid"),
          from_uid: auth.currentUser.uid,
          answerId: ans.id,
          dateCreated: serverTimestamp(),
        }).catch((e) => {});
      });

      setSending(false);
      setGif(null);
      setPickedImage(null);
      setFile(null);
      setResults([]);
      setText("");
      setOpen(true);
      return;
    }

    if (pickedImage != null) {
      // upload to storage and setPicked

      setSending(true);

      const imageRef = ref(storage, `images/${Date.now()}`);

      const metadata = {
        contentType: "image/png",
      };

      uploadBytes(imageRef, pickedImage, metadata).then((snap) => {
        getDownloadURL(snap.ref).then(async (path) => {
          const reference = collection(db, "answers");

          const ans = await addDoc(reference, {
            answerImage: path,
            answerText: text,
            dateCreated: serverTimestamp(),
            uid: auth.currentUser.uid,
            deleted: false,
            questionId: id,
            likes: 0,
            comments: 0,
          }).catch((e) => {
            setSending(false);
          });

          // notify asker
          const notiRef = collection(db, "notifications");
          addDoc(notiRef, {
            dateCreated: serverTimestamp(),
            from_uid: auth.currentUser.uid,
            to_uid: ques.get("uid"),
            postId: ans.id,
            type: "answer",
          }).catch((e) => {});

          updateDoc(doc(db, "users_public", ques.get("uid")), {
            notificationsCount: increment(1),
          });

          const followRef = collection(db, "following");

          const timelineRef = collection(db, "timeline");

          const q = query(
            followRef,
            where("userFollowingId", "==", auth.currentUser.uid)
          );

          const snap = await getDocs(q).catch((e) => {});

          snap.docs
            .forEach((s) => {
              addDoc(timelineRef, {
                to_uid: s.get("uid"),
                from_uid: auth.currentUser.uid,
                answerId: ans.id,
                dateCreated: serverTimestamp(),
              }).catch((e) => {});
            })
            .catch((e) => {});
        });
      });

      setGif(null);
      setPickedImage(null);
      setFile(null);
      setResults([]);
      setSending(false);
      setText("");
      setOpen(true);
      return;
    }

    setSending(true);
    const reference = collection(db, "answers");

    const ans = await addDoc(reference, {
      answerImage: "",
      answerText: text,
      dateCreated: serverTimestamp(),
      uid: auth.currentUser.uid,
      deleted: false,
      questionId: id,
      likes: 0,
      comments: 0,
    }).catch((e) => {
      setSending(false);
    });

    // notify asker
    const notiRef = collection(db, "notifications");
    addDoc(notiRef, {
      dateCreated: serverTimestamp(),
      from_uid: auth.currentUser.uid,
      to_uid: ques.get("uid"),
      postId: ans.id,
      type: "answer",
    }).catch((e) => {});

    updateDoc(doc(db, "users_public", ques.get("uid")), {
      notificationsCount: increment(1),
    });

    const followRef = collection(db, "following");

    const timelineRef = collection(db, "timeline");

    const q = query(
      followRef,
      where("userFollowingId", "==", auth.currentUser.uid)
    );

    const snap = await getDocs(q).catch((e) => {});

    snap.docs.forEach((s) => {
      addDoc(timelineRef, {
        to_uid: s.get("uid"),
        from_uid: auth.currentUser.uid,
        answerId: ans.id,
        dateCreated: serverTimestamp(),
      }).catch((e) => {});
    });

    setGif(null);
    setPickedImage(null);
    setFile(null);
    setResults([]);
    setText("");
    setOpen(true);
    setSending(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Success :)"
      />
      <Question
        questions={question}
        embedded={false}
        questionId={id}
        a={answers}
      />
      {!loggedIn ? (
        <div></div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "10px",
            marginLeft: "10px",
          }}
        >
          <TextField
            onChange={(e) => {
              e.preventDefault();
              setText(e.target.value);
            }}
            value={text}
            fullWidth
            multiline
            maxRows={200}
            inputProps={{ maxLength: 500 }}
            placeholder="Post your reply"
          />
          <IconButton onClick={getGifs}>
            <GifBoxOutlined />
          </IconButton>
          <IconButton component="label">
            <input
              accept="image/*"
              hidden
              type="file"
              multiple={false}
              onChange={handleImageSelection}
            />
            <Image />
          </IconButton>
          <IconButton onClick={sendPost} disabled={sending}>
            <Send />
          </IconButton>
        </div>
      )}
      {file == null ? (
        <div></div>
      ) : (
        <div
          onClick={() => setFile(null)}
          style={{
            marginTop: "10px",
            backgroundImage: `url('${file}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            width: "100%",
            height: "400px",
            borderRadius: "5px",
          }}
        ></div>
      )}
      {searching ? (
        <TextField
          placeholder="Search Tenor"
          onChange={handleSearch}
          style={{
            width: "90%",
            marginBottom: "10px",
            marginLeft: "10px",
            marginTop: "10px",
          }}
        ></TextField>
      ) : (
        <div></div>
      )}
      {searching == false ? (
        <div></div>
      ) : (
        <Grid
          style={{
            marginLeft: "10px",
            marginTop: "10px",
            marginRight: "10px",
          }}
          container
          spacing={0}
        >
          {results.map((result, index) => (
            <Grid item xs={6} key={index}>
              <div
                style={{
                  borderRadius: "5px",
                  backgroundImage: `url(${result})`,
                  width: "100%",
                  height: "200px",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
                onClick={() => handleGifSelection(result)}
              ></div>
            </Grid>
          ))}
        </Grid>
      )}
      {gif == null ? (
        <div></div>
      ) : (
        <div
          onClick={handleCloseSelection}
          style={{
            marginTop: "10px",
            backgroundImage: `url('${gif}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            width: "100%",
            height: "400px",
            borderRadius: "5px",
          }}
        ></div>
      )}
      <Divider style={{ width: "100%", marginTop: "10px" }}></Divider>
      <Typography style={{ marginTop: "10px", marginBottom: "10px" }}>
        Answers
      </Typography>
      <Divider style={{ width: "100%" }}></Divider>
      {answers.map((a, i) => {
        return <Answer a={a} key={i} alone={true} />;
      })}
      {loadingMore ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={20} />
        </div>
      ) : (
        <div></div>
      )}
    </Container>
  );
}

export default QuestionPage;
