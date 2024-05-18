import React, { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const FeedContext = createContext();

export function useFeedContext() {
  return useContext(FeedContext);
}

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { loggedIn, isLoading, uid } = useAuth();
  const [initialLoad, setInitial] = useState(true);
  const [seconds, setSeconds] = useState(null);
  const [nanoseconds, setNanoseconds] = useState(null);
  const [more, setMore] = useState(true);

  const loadPosts = async (initialLoad) => {
    try {
      if (more) {
        setLoading(true); // Set loading to true at the start of loading

        const url = initialLoad
          ? `https://us-central1-mimefly-qa.cloudfunctions.net/app/timeline/${uid}`
          : `https://us-central1-mimefly-qa.cloudfunctions.net/app/moreTimeline/${uid}?seconds=${seconds}&nanoseconds=${nanoseconds}`;

        const response = await axios.get(url).catch((e) => {});

        if (response.data.length == 0) {
          setLoadingMore(false);
          setLoading(false);
          setInitial(false);
          return;
        }

        if (initialLoad) {
          setInitial(false);
          setPosts(response.data);
        } else {
          setInitial(false);
          setPosts((prev) => [...prev, ...response.data]);
        }

        if (response.data.length < 10) {
          setMore(false);
          return;
        }

        const lastPost = response.data[response.data.length - 1];
        setSeconds(lastPost.dateCreated._seconds);
        setNanoseconds(lastPost.dateCreated._nanoseconds);
      }
    } catch (e) {
    } finally {
      setLoading(false); // Set loading to false once the loading process is complete
      setLoadingMore(false);
      setInitial(false);
    }
  };

  useEffect(() => {
    if (loggedIn && !isLoading) {
      loadPosts(initialLoad);
    }
  }, [isLoading, loggedIn]);

  return (
    <FeedContext.Provider value={{ posts, loadPosts, loading, loadingMore }}>
      {children}
    </FeedContext.Provider>
  );
}
