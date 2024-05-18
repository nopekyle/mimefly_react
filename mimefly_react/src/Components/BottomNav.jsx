import React, { useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Mail";
import Paper from "@mui/material/Paper";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import { Button, Container } from "@mui/material";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { auth } from "../firebase";

export default function BottomNav() {
  const db = getFirestore();
  const history = useHistory();
  const location = useLocation();

  const [selectedValue, setSelectedValue] = useState(
    getInitialSelectedValue(location.pathname)
  );

  function getInitialSelectedValue(pathname) {
    if (pathname === "/search") {
      return "search";
    } else if (pathname === "/notifications") {
      return "notifications";
    } else if (pathname === "/inbox") {
      return "inbox";
    } else if (pathname === "/profile") {
      return "profile";
    } else {
      return "home";
    }
  }

  const { loggedIn, username, notifications, inbox, avatar, uid } = useAuth();

  const resetNotifications = async () => {
    const user = doc(db, "users_public", auth.currentUser.uid);
    updateDoc(user, {
      notificationsCount: 0,
    }).catch((e) => {});
  };

  const resetInbox = async () => {
    const user = doc(db, "users_public", auth.currentUser.uid);
    updateDoc(user, {
      inboxCount: 0,
    }).catch((e) => {});
  };

  return (
    <div>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        elevation={3}
      >
        {loggedIn == false ? (
          <Container maxWidth="xs" component="main">
            <BottomNavigation value={selectedValue}>
              <BottomNavigationAction
                onClick={() => history.push("/i/login")}
                value="login"
                icon={<Button>Sign In</Button>}
              />
              <BottomNavigationAction
                onClick={() => history.push("/i/register")}
                value="register"
                icon={<Button>Register</Button>}
              />
            </BottomNavigation>
          </Container>
        ) : loggedIn == undefined ? (
          <div></div>
        ) : (
          <Container maxWidth="xs" component="main">
            <BottomNavigation value={selectedValue}>
              <BottomNavigationAction
                sx={{
                  "&.Mui-selected": {
                    color: "#00a8f3", // Change the color when selected
                  },
                }}
                value="home"
                icon={<HomeIcon />}
                onClick={() => {
                  {
                    setSelectedValue("home");
                    history.push("/");
                  }
                }}
              />
              <BottomNavigationAction
                sx={{
                  "&.Mui-selected": {
                    color: "#00a8f3", // Change the color when selected
                  },
                }}
                value="search"
                icon={<SearchIcon />}
                onClick={() => {
                  {
                    setSelectedValue("search");
                    history.push("/i/search");
                  }
                }}
              />
              <BottomNavigationAction
                sx={{
                  "&.Mui-selected": {
                    color: "#00a8f3", // Change the color when selected
                  },
                }}
                value="notifications"
                icon={
                  <Badge badgeContent={notifications}>
                    <NotificationIcon />
                  </Badge>
                }
                onClick={() => {
                  {
                    setSelectedValue("notifications");
                    history.push("/i/notifications");
                    resetNotifications();
                  }
                }}
              />
              <BottomNavigationAction
                value="inbox"
                sx={{
                  "&.Mui-selected": {
                    color: "#00a8f3", // Change the color when selected
                  },
                }}
                icon={
                  <Badge badgeContent={inbox}>
                    <MessageIcon />
                  </Badge>
                }
                onClick={() => {
                  {
                    setSelectedValue("inbox");
                    history.push("/i/inbox");
                    resetInbox();
                  }
                }}
              />
              <BottomNavigationAction
                sx={{
                  "&.Mui-selected": {
                    color: "blue", // Change the color when selected
                  },
                }}
                value="profile"
                icon={<Avatar src={`${avatar}`} />}
                onClick={() => {
                  {
                    setSelectedValue("profile");
                    history.push(`/${username}`);
                  }
                }}
              />
            </BottomNavigation>
          </Container>
        )}
      </Paper>
      <div style={{ height: "50px" }}></div>
    </div>
  );
}
