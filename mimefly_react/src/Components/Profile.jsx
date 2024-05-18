import { React, useState, useEffect } from "react";
import {
  CssBaseline,
  Typography,
  IconButton,
  Stack,
  Avatar,
} from "@mui/material";
import { Settings, MailOutlineRounded } from "@mui/icons-material";
import { TextField, Grid, Button } from "@mui/material";
import { GifBoxOutlined, Image, Send } from "@mui/icons-material";
import { useAuth } from "../AuthContext";
import { auth, firestore, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  onSnapshot,
  where,
  query,
  getDocs,
  getDoc,
  deleteDoc,
  addDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import BasicTabs from "./BasicTabs";
import "../assets/styles.css";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";

function Profile({ match }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [file, setFile] = useState(null);
  const [gif, setGif] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [following, setFollowing] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { loggedIn, uid, username } = useAuth();

  const history = useHistory();

  useEffect(() => {
    getProfile();
    checkIfFollows();
  }, [match.params.username]);

  const checkIfFollows = async () => {
    if (!loggedIn) {
      return;
    }

    const db = firestore;

    let uRef = collection(db, "users");
    let uq = query(uRef, where("username", "==", match.params.username));
    let uSnap = await getDocs(uq);

    let snap = await getDoc(
      doc(db, "following", auth.currentUser.uid + uSnap.docs[0].id)
    );

    if (!snap.exists()) {
      setFollowing(false);
      return;
    }

    setFollowing(true);
  };

  const handleFollowChange = async () => {
    const db = firestore;

    if (following) {
      deleteDoc(doc(db, "following", auth.currentUser.uid + user.uid)).catch(
        (e) => {}
      );

      updateDoc(doc(db, "users_public", user.uid), {
        followers: increment(-1),
      }).catch((e) => {});

      updateDoc(doc(db, "users_public", auth.currentUser.uid), {
        following: increment(-1),
      }).catch((e) => {});

      setFollowing(false);
      return;
    } else {
      await setDoc(doc(db, "following", auth.currentUser.uid + user.uid), {
        uid: auth.currentUser.uid,
        userFollowingId: user.uid,
      });
      // increase users follower count
      updateDoc(doc(db, "users_public", user.uid), {
        followers: increment(1),
      }).catch((e) => {});

      // increase auth users following count
      updateDoc(doc(db, "users_public", auth.currentUser.uid), {
        following: increment(1),
      }).catch((e) => {});

      // send notifications to user
      addDoc(collection(db, "notifications"), {
        to_uid: user.uid,
        from_uid: auth.currentUser.uid,
        type: "follow",
        postId: username,
        dateCreated: serverTimestamp(),
      }).catch((e) => {});

      setDoc(
        doc(db, "users_public", user.uid),
        {
          notificationsCount: increment(1),
        },
        { merge: true }
      ).catch((e) => {});

      setFollowing(true);
    }
  };

  const sendDirect = async () => {
    if (text.trim() == "") {
      return;
    }

    const db = firestore;

    if (gif != null) {
      setSending(true);
      const reference = collection(db, "questions");

      const ques = await addDoc(reference, {
        questionImage: gif,
        questionText: text,
        dateCreated: serverTimestamp(),
        uid: auth.currentUser.uid,
        deleted: false,
        direct: true,
        anonymous: false,
        answerCount: 0,
      }).catch((e) => {
        setSending(false);
      });

      await addDoc(collection(db, "inbox"), {
        questionId: ques.id,
        uid: user.uid,
        dateCreated: serverTimestamp(),
        from_uid: auth.currentUser.uid,
      }).catch((e) => {});

      await updateDoc(doc(db, "users_public", user.uid), {
        inboxCount: increment(1),
      }).catch((e) => {
        setSending(false);
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

      uploadBytes(imageRef, pickedImage, metadata)
        .then((snap) => {
          getDownloadURL(snap.ref)
            .then(async (path) => {
              const reference = collection(db, "questions");

              const ques = await addDoc(reference, {
                questionImage: path,
                questionText: text,
                dateCreated: serverTimestamp(),
                uid: auth.currentUser.uid,
                deleted: false,
                direct: true,
                anonymous: false,
                answerCount: 0,
              }).catch((e) => {
                setSending(false);
              });

              await addDoc(collection(db, "inbox"), {
                questionId: ques.id,
                uid: user.uid,
                dateCreated: serverTimestamp(),
                from_uid: auth.currentUser.uid,
              }).catch((e) => {});

              await updateDoc(doc(db, "users_public", user.uid), {
                inboxCount: increment(1),
              }).catch((e) => {
                setSending(false);
              });
            })
            .catch((e) => {});
        })
        .catch((e) => {});

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
    const reference = collection(db, "questions");

    const ques = await addDoc(reference, {
      questionImage: "",
      questionText: text,
      dateCreated: serverTimestamp(),
      uid: auth.currentUser.uid,
      deleted: false,
      direct: true,
      anonymous: false,
      answerCount: 0,
    }).catch((e) => {
      setSending(false);
    });

    await addDoc(collection(db, "inbox"), {
      questionId: ques.id,
      uid: user.uid,
      dateCreated: serverTimestamp(),
      from_uid: auth.currentUser.uid,
    }).catch((e) => {});

    await updateDoc(doc(db, "users_public", user.uid), {
      inboxCount: increment(1),
    }).catch((e) => {
      setSending(false);
    });

    setGif(null);
    setPickedImage(null);
    setFile(null);
    setResults([]);
    setText("");
    setOpen(true);
    setSending(false);
  };

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

  const getProfile = async () => {
    const db = firestore;
    let u = {};

    let ref = collection(db, "users");
    let q = query(
      ref,
      where("username_lowercase", "==", match.params.username.toLowerCase())
    );
    let snap = await getDocs(q);

    if (snap.empty) {
      setNotFound(true);
      return;
    }

    const unsubUser = onSnapshot(
      doc(db, "users", snap.docs[0].id),
      async (doc) => {
        // ...
        u = {
          profilePic: doc.get("profilePic"),
          coverPic: doc.get("coverPic"),
          username: doc.get("username"),
          displayName: doc.get("displayName"),
          bio: doc.get("about"),
          deleted: doc.get("deleted"),
          uid: doc.id,
        };
        setUser(u);
      },
      (error) => {}
    );

    if (user.deleted) {
      setNotFound(true);
      return;
    }

    const unsubUserPublic = onSnapshot(
      doc(db, "users_public", snap.docs[0].id),
      async (doc) => {
        u["followers"] = doc.get("followers");
        u["following"] = doc.get("following");
        setUser(u);
      },
      (error) => {}
    );

    await Promise.all([unsubUser, unsubUserPublic]);

    setLoading(false);
    setNotFound(false);
  };

  if (loading) {
    return <div></div>;
  } else if (user.deleted || notFound) {
    return <div>404</div>;
  } else {
    return (
      <div className="custom-container">
        <CssBaseline />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div>
            <div
              style={{
                backgroundImage: `url('${user.coverPic}')`,
                height: "180px",
                position: "relative",
                backgroundSize: "cover",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <Avatar
                src={`${user.profilePic}`}
                sx={{
                  width: "90px",
                  height: "90px",
                }}
              ></Avatar>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "10px",
              marginBottom: "10px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <Typography fontSize={24}>
              {user.displayName} / @{user.username}
            </Typography>
            <div style={{ flex: "1" }}></div>
            {user.uid == uid ? (
              <div></div>
            ) : (
              <Button onClick={handleFollowChange}>
                {following ? "Unfollow" : "Follow"}
              </Button>
            )}
            {auth.currentUser == null ? (
              <div></div>
            ) : (
              <IconButton>
                <MailOutlineRounded />
              </IconButton>
            )}
            {user.uid == uid ? (
              <IconButton
                onClick={() => {
                  history.push("/i/settings");
                }}
              >
                <Settings />
              </IconButton>
            ) : (
              <div></div>
            )}
          </div>

          <Stack
            spacing={{ xs: 1, sm: 2 }}
            direction="row"
            useFlexGap
            flexWrap="wrap"
          >
            <Typography style={{ paddingLeft: "10px", paddingRight: "10px" }}>
              {user.followers} Followers
            </Typography>
            <Typography>{user.following} Following</Typography>
          </Stack>

          <Typography
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            {user.bio}
          </Typography>
          {auth.currentUser == null ? (
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
                placeholder="What's up?"
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
              <IconButton
                disabled={sending ? true : false}
                onClick={sendDirect}
              >
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
                <Grid item xs={6} key={result.id}>
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
          <BasicTabs uid={user.uid} index={0} value={0} />
        </div>
      </div>
    );
  }
}

export default Profile;
