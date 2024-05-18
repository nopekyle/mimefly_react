import React, { useRef, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { useFeedContext } from "../FeedContext";
import Post from "./Post";
import {
  CircularProgress,
  IconButton,
  TextField,
  Grid,
  Snackbar,
} from "@mui/material";
import { GifBoxOutlined, Image, Send } from "@mui/icons-material";
import axios from "axios";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, storage } from "../firebase";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";

function Feed() {
  const sentinelRef = useRef(null);
  const db = getFirestore();

  const { posts, loadPosts, loading, loadingMore } = useFeedContext();
  const [file, setFile] = useState(null);
  const [gif, setGif] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    setOpen(false);
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

  const sendPost = async () => {
    if (text.trim() == "") {
      return;
    }

    if (gif != null) {
      setSending(true);
      const reference = collection(db, "questions");

      const qRef = await addDoc(reference, {
        questionImage: gif,
        questionText: text,
        dateCreated: serverTimestamp(),
        uid: auth.currentUser.uid,
        deleted: false,
        direct: false,
        anonymous: false,
        answerCount: 0,
      }).catch((e) => {
        setSending(false);
      });

      const followRef = collection(db, "following");

      const q = query(
        followRef,
        where("userFollowingId", "==", auth.currentUser.uid)
      );

      const followers = await getDocs(q).catch((e) => {});

      if (followers.docs.length == 0) {
        setGif(null);
        setPickedImage(null);
        setFile(null);
        setResults([]);
        setSending(false);
        setOpen(true);
        setText("");
        return;
      }

      for (let i = 0; i < followers.docs.length; i++) {
        const inboxRef = collection(db, "inbox");
        addDoc(inboxRef, {
          questionId: qRef.id,
          uid: followers.docs[i].get("uid"),
          dateCreated: serverTimestamp(),
          from_uid: auth.currentUser.uid,
        }).catch((e) => {
          setSending(false);
        });

        await updateDoc(doc(db, "users_public", followers.docs[i].get("uid")), {
          inboxCount: increment(1),
        }).catch((e) => {
          setSending(false);
        });
      }
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

              const qRef = await addDoc(reference, {
                questionImage: path,
                questionText: text,
                dateCreated: serverTimestamp(),
                uid: auth.currentUser.uid,
                deleted: false,
                direct: false,
                anonymous: false,
                answerCount: 0,
              }).catch((e) => {
                setSending(false);
              });

              const followRef = collection(db, "following");

              const q = query(
                followRef,
                where("userFollowingId", "==", auth.currentUser.uid)
              );

              const followers = await getDocs(q).catch((e) => {});

              if (followers.docs.length == 0) {
                setGif(null);
                setPickedImage(null);
                setFile(null);
                setResults([]);
                setSending(false);
                setText("");
                setOpen(true);
                setSending(false);
                return;
              }

              for (let i = 0; i < followers.docs.length; i++) {
                const inboxRef = collection(db, "inbox");
                addDoc(inboxRef, {
                  questionId: qRef.id,
                  uid: followers.docs[i].get("uid"),
                  dateCreated: serverTimestamp(),
                  from_uid: auth.currentUser.uid,
                }).catch((e) => {
                  setSending(false);
                });

                await updateDoc(
                  doc(db, "users_public", followers.docs[i].get("uid")),
                  {
                    inboxCount: increment(1),
                  }
                ).catch((e) => {
                  setSending(false);
                });
              }
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

    const qRef = await addDoc(reference, {
      questionImage: "",
      questionText: text,
      dateCreated: serverTimestamp(),
      uid: auth.currentUser.uid,
      deleted: false,
      direct: false,
      anonymous: false,
      answerCount: 0,
    }).catch((e) => {
      setSending(false);
    });

    const followRef = collection(db, "following");

    const q = query(
      followRef,
      where("userFollowingId", "==", auth.currentUser.uid)
    );

    const followers = await getDocs(q).catch((e) => {});

    if (followers.docs.length == 0) {
      setSending(false);
      setGif(null);
      setPickedImage(null);
      setFile(null);
      setResults([]);
      setText("");
      setOpen(true);
      return;
    }

    for (let i = 0; i < followers.docs.length; i++) {
      const inboxRef = collection(db, "inbox");
      addDoc(inboxRef, {
        questionId: qRef.id,
        uid: followers.docs[i].get("uid"),
        dateCreated: serverTimestamp(),
        from_uid: auth.currentUser.uid,
      }).catch((e) => {
        setSending(false);
      });

      await updateDoc(doc(db, "users_public", followers.docs[i].get("uid")), {
        inboxCount: increment(1),
      }).catch((e) => {
        setSending(false);
      });
    }

    setGif(null);
    setPickedImage(null);
    setFile(null);
    setResults([]);
    setText("");
    setOpen(true);
    setSending(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        // When the sentinel enters the viewport and not already loading,
        // trigger the loading of more posts.
        loadPosts(false);
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    // Clean up the observer when the component unmounts
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [sentinelRef, loading, loadPosts, loadingMore]);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Success :)"
      />
      <div style={{ display: "flex", flexDirection: "row", marginTop: "10px" }}>
        <TextField
          onChange={(e) => {
            e.preventDefault();
            setText(e.target.value);
          }}
          multiline
          value={text}
          inputProps={{ maxLength: 500 }}
          placeholder="What's up?"
          style={{ width: "100%" }}
        ></TextField>
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
        <IconButton disabled={sending ? true : false} onClick={sendPost}>
          <Send />
        </IconButton>
      </div>
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
      <div>
        {posts.map((p) => {
          return (
            <Post data={p} key={p.answerId} embedded={true} alone={false} />
          );
        })}
      </div>
      {/* Sentinel at the end of posts */}
      <div ref={sentinelRef} id="sentinel" style={{ height: "10px" }}></div>
      {/* Loading indicator at the bottom */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "20px",
        }}
      >
        {loading && <CircularProgress size={20} />}
      </div>
    </Container>
  );
}

export default Feed;
