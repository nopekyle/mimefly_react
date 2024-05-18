import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Login from "./Components/Login";
import "./App.css";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import Comment from "./Components/Comment";
import QuestionPage from "./Components/QuestionPage";
import AnswerPage from "./Components/AnswerPage";
import SignedOutFeed from "./Components/SignedOutFeed";
import Feed from "./Components/Feed";
import { useAuth } from "./AuthContext";
import SearchPage from "./Components/Search";
import Notifications from "./Components/Notifications";
import Inbox from "./Components/Inbox";
import React  from "react";
import BottomNav from "./Components/BottomNav";
import Splash from "./Components/Splash";
import Settings from "./Components/Settings";
import Edit from "./Components/Edit";

function App({appLoaded}) {
  const { loggedIn } = useAuth();

  return (
    <Router>
      {appLoaded ? (
        <Switch>
          <Route path="/" exact component={loggedIn ? Feed : SignedOutFeed} />
          <Route
            path="/i/login"
            render={() => (loggedIn ? <Redirect to="/" /> : <Login />)}
          />
          <Route
            path="/i/register"
            render={() => (loggedIn ? <Redirect to="/" /> : <Register />)}
          />
          <Route path="/:username" exact component={Profile} />
          <Route path='/i/settings'  render={() => (!loggedIn ? <Redirect to="/" /> : <Settings />)} />
          <Route path='/i/edit'  render={() => (!loggedIn ? <Redirect to="/" /> : <Edit/>)} />
          <Route path="/c/:id" component={Comment} />
          <Route path="/q/:id" component={QuestionPage} />
          <Route path="/a/:id" component={AnswerPage} />
          <Route path="/i/search" component={SearchPage} />
          <Route path="/i/notifications" component={Notifications} />
          <Route path="/i/inbox" component={Inbox} />
        </Switch>
      ) : (
        <Splash />
      )}
      {appLoaded && shouldDisplayBottomNav() && <BottomNav />}
    </Router>
  );

  function shouldDisplayBottomNav() {
    // Define logic to determine when to display the BottomNav
    const nonBottomNavPages = ["/i/login", "/i/register"];
    return !nonBottomNavPages.includes(window.location.pathname);
  }
}

export default App;
