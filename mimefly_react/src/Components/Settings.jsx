import React, { useState } from "react";
import {
  Container,
  CssBaseline,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Snackbar,
} from "@mui/material";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { getDoc, getFirestore, doc, updateDoc } from "firebase/firestore";

export default function Settings() {
  const auth = getAuth();
  const db = getFirestore();
  const [open, setOpen] = useState(false);
  const [sbOpen, setSbOpen] = useState(false);
  const history = useHistory();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleSbClose = () => {
    setSbOpen(false);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    const ref = doc(db, 'users', auth.currentUser.uid);
    const deleted =  await updateDoc(ref, {
        'deleted' : false
    }).catch(e => {
    });
    if(deleted){
        setOpen(false);
        history.push('/');
    }
  };

  const changePassword = async () => {
    await sendPasswordResetEmail(auth, auth.currentUser.email).catch(e => {

    });

    setSbOpen(true);
}


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Snackbar
        open={sbOpen}
        onClose={handleSbClose}
        autoHideDuration={3000}
        message='A reset password email has been sent!'
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure? You cannot undo this action."}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Paper onClick={() => history.push('/i/edit')} style={{ padding: "10px", margin: "10px" }}>
        <Typography>Edit Profile</Typography>
      </Paper>
      <Paper onClick={changePassword} style={{ padding: "10px", margin: "10px" }}>
        <Typography>Change Password</Typography>
      </Paper>
      <Paper
        style={{ padding: "10px", margin: "10px" }}
        onClick={() => auth.signOut()}
      >
        <Typography>Sign Out</Typography>
      </Paper>
      <Paper
        style={{ padding: "10px", margin: "10px" }}
        onClick={handleClickOpen}
      >
        <Typography>Delete Account</Typography>
      </Paper>
    </Container>
  );
}
