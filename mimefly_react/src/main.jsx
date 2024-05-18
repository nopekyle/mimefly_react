import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./AuthContext.jsx";
import { QuestionProvider } from "./SignedOutContext.jsx";
import MainApp from "./Components/MainApp.jsx";
import { FeedProvider } from "./FeedContext";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.Suspense fallback={<div>Loading...</div>}>
    <AuthProvider>
      <QuestionProvider>
        <FeedProvider>
        <MainApp />
        </FeedProvider>
      </QuestionProvider>
    </AuthProvider>
  </React.Suspense>
);