import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Logo from "../assets/logo.png";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  increment,
} from "firebase/firestore";
import { useHistory } from "react-router-dom";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      Mimefly Inc. {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

function Register() {
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleError = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    setOpen(false);
  };

  const [validationError, setValidationError] = useState('');

  const handleInputChange = (event) => {
    const newValue = event.target.value;
  
    const regex = /^[a-zA-Z0-9]+$/;

    if (!regex.test(newValue)) {
      setValidationError('Input must be alphanumeric with no whitespace.');
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
   
    try {
      const db = getFirestore();

      // check if username exists
      let username = data.get("username").trim().toLowerCase();

      const ref = collection(db, "users");

      const q = query(ref, where("username_lowercase", "==", username));

      const querySnapshot = await getDocs(q);

      // return if username exists

      if (querySnapshot.size > 0) {
        setError("Username is taken");
        handleError();
        return;
      }

      // try to sign up

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.get("email"),
        data.get("password")
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        about: "",
        coverPic:
          "https://firebasestorage.googleapis.com/v0/b/mimefly-qa.appspot.com/o/default_bg.jpg?alt=media&token=807b3aff-dc98-40db-b3b1-dd652a9a2755",
        displayName: username,
        likes: 0,
        profilePic:
          "https://firebasestorage.googleapis.com/v0/b/mimefly-qa.appspot.com/o/default.jpg?alt=media&token=94cfe533-8830-4851-8168-6c86f2853e9d",
        username: username,
        username_lowercase: username.toLowerCase(),
        search_key: username.substring(0, 1).toUpperCase(),
        username_array: username.toLowerCase().split(""),
        verified: false,
        mod: false,
        deleted: false,
        private: false,
      });

      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        uid: uid,
      });

      await setDoc(doc(db, "users_public", uid), {
        followers: 0,
        following: 0,
        inboxCount: 0,
        notificationsCount: 0,
      });

      await setDoc(
        doc(db, "statistics", "users"),
        {
          count: increment(1),
        },
        { merge: true }
      );

      sendEmailVerification(userCredential.user);

      history.push("/");
    } catch (e) {
      handleError();
      setError(e.toString());
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          message={error}
        />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} src={Logo}></Avatar>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoFocus
              onChange={handleInputChange}
              error={Boolean(validationError)}
              helperText={validationError}
              inputProps={{maxLength: 15}}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: "#00a8f3" }}
            >
              Register
            </Button>
            <Typography align="center">
              <Link href="/i/login">Already have an account? Login</Link>
            </Typography>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}

export default Register;
