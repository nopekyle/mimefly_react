import React, { useEffect, useState } from "react";
import "../assets/styles.css";
import {
  Button,
  CssBaseline,
  TextField,
  Snackbar,
  Avatar,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function Edit() {
  const [coverPic, setCoverPic] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [coverTemp, setCoverTemp] = useState(null);
  const [profileTemp, setProfileTemp] = useState(null);
  const [bioTemp, saveBioTemp] = useState("");
  const [displayNameTemp, saveDisplayNameTemp] = useState("");
  const [open, setOpen] = useState(false);
  const [pickedAvatar, setPickedAvatar] = useState(null);
  const [pickedCover, setPickedCover] = useState(null);

  const { uid } = getAuth();

  const handleClose = (event, reason) => {
    setOpen(false);
  };

  const handleCoverSelection = (event) => {
    const selectedFile = URL.createObjectURL(event.target.files[0]);
    setPickedCover(event.target.files[0]);
    setCoverTemp(selectedFile);
  };

  const handleProfileSelection = (event) => {
    const selectedFile = URL.createObjectURL(event.target.files[0]);
    setPickedAvatar(event.target.files[0]);
    setProfileTemp(selectedFile);
  };

  const uploadAvatar = async () => {
    if (!pickedAvatar) {
      return;
    }

    const imageRef = ref(storage, `images/${Date.now()}`);

    const metadata = {
      contentType: "image/png",
    };

    uploadBytes(imageRef, pickedAvatar, metadata)
      .then((snap) => {
        getDownloadURL(snap.ref)
          .then(async (url) => {
            const ref = doc(db, "users", auth.currentUser.uid);
            const res = await updateDoc(ref, {
              profilePic: url,
            }).catch((e) => {});
          })
          .catch((e) => {});
        setOpen(true);
      })
      .catch((e) => {});
  };

  const uploadCover = async () => {
    if (!pickedCover) {
      return;
    }

    const imageRef = ref(storage, `images/${Date.now()}`);

    const metadata = {
      contentType: "image/png",
    };

    uploadBytes(imageRef, pickedCover, metadata)
      .then((snap) => {
        getDownloadURL(snap.ref)
          .then(async (url) => {
            const ref = doc(db, "users", auth.currentUser.uid);
            const res = await updateDoc(ref, {
              coverPic: url,
            }).catch((e) => {});
          })
          .catch((e) => {});
        setOpen(true);
      })
      .catch((e) => {});
  };

  const db = getFirestore();
  const auth = getAuth();

  const getUser = async () => {
    const ref = doc(db, "users", auth.currentUser.uid);
    const user = await getDoc(ref).catch((e) => {});

    setCoverPic(user.get("coverPic"));
    setProfilePic(user.get("profilePic"));
  };

  const handleDisplayChange = (e) => {
    saveDisplayNameTemp(e.target.value);
  };

  const handleBioChange = (e) => {
    saveBioTemp(e.target.value);
  };

  const saveDisplayName = async (event) => {
    event.preventDefault();
    if (displayNameTemp.trim() == "") {
      return;
    }

    const ref = doc(db, "users", auth.currentUser.uid);

    updateDoc(ref, {
      displayName: displayNameTemp,
    })
      .then(() => {
        setOpen(true);
      })
      .catch((e) => {});
  };

  const saveBio = async (event) => {
    event.preventDefault();
    if (bioTemp.trim() == "") {
      return;
    }

    const ref = doc(db, "users", auth.currentUser.uid);

    updateDoc(ref, {
      about: bioTemp,
    })
      .then(() => {
        setOpen(true);
      })
      .catch((e) => {});
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="custom-container">
      <CssBaseline />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Success :)"
      />
      <div
        style={{
          backgroundImage: `url('${coverTemp == null ? coverPic : coverTemp}')`,
          height: "180px",
          position: "relative",
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar
          src={`${profileTemp == null ? profilePic : profileTemp}`}
          sx={{
            width: "90px",
            height: "90px",
          }}
        ></Avatar>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <label htmlFor="fileInput">
            <Button component="span">Profile Picture</Button>
          </label>
          <input
            accept="image/*"
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleProfileSelection}
          />
        </div>
        <div>
          <label htmlFor="fileInputCover">
            <Button component="span">Cover Picture</Button>
          </label>
          <input
            accept="image/*"
            id="fileInputCover"
            type="file"
            style={{ display: "none" }}
            onChange={handleCoverSelection}
          />
        </div>
        <Button
          onClick={() => {
            setCoverTemp(null);
            setProfileTemp(null);
          }}
        >
          Reset
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={async () => {
            await uploadAvatar();
            setPickedAvatar(null);
          }}
        >
          Save Profile Picture
        </Button>
        <Button
          onClick={async () => {
            await uploadCover();
            setPickedCover(null);
          }}
        >
          Save Cover Picture
        </Button>
      </div>

      <form onSubmit={saveDisplayName}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextField
            value={displayNameTemp}
            onChange={handleDisplayChange}
            inputProps={{ maxLength: "20" }}
            placeholder="Change display name"
          />
          <Button type="submit">Save</Button>
        </div>
      </form>

      <form onSubmit={saveBio}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextField
            value={bioTemp}
            onChange={handleBioChange}
            inputProps={{ maxLength: "100" }}
            placeholder="Change bio"
          ></TextField>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
