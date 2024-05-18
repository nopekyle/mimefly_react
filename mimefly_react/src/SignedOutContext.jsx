import React, { createContext, useState, useContext, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { useAuth } from "./AuthContext";

const QuestionContext = createContext();

export function useQuestionContext() {
  return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null); // New state for last document
  const { loggedIn, isLoading } = useAuth();

  const addQuestions = (newQuestions) => {
    setQuestions((prev) => [...prev, ...newQuestions]);
  };

  useEffect(() => {
    if (!isLoading && !loggedIn) {
      getQuestions();
    }
  }, [isLoading, loggedIn]);

  const getQuestions = async () => {
    try {
      const db = firestore;

      let ref = collection(db, "questions");

      let q = query(
        ref,
        where("direct", "==", false),
        where("deleted", "==", false),
        orderBy("dateCreated", "desc"),
        limit(20)
      );

      let querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length < 1) {
        setLoading(false);
        setQuestions([]);
        setLastDoc(null);
        return;
      }

      let documents = [];

      for (let i = 0; i < querySnapshot.docs.length; i++) {
        let uid = querySnapshot.docs[i].get("uid");
        let user = await getDoc(doc(db, "users", uid));
        let meta = await getDoc(
          doc(
            db,
            `questions/${querySnapshot.docs[i].id}/meta/${querySnapshot.docs[i].id}`
          )
        );

        documents.push({
          answerCount: meta.get("answer_count"),
          askerPic: user.get("profilePic"),
          askerUsername: user.get("username"),
          askerName: user.get("displayName"),
          dateCreated: {
            _seconds: querySnapshot.docs[i].get("dateCreated").seconds,
            _nanoseconds: querySnapshot.docs[i].get("dateCreated").nanoseconds,
          },
          questionId: querySnapshot.docs[i].id,
          questionImage: querySnapshot.docs[i].get("questionImage"),
          questionText: querySnapshot.docs[i].get("questionText"),
          questionDeleted: querySnapshot.docs[i].get("deleted"),
          uid: user.id,
        });
      }

      setQuestions((prev) => [...prev, ...documents]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]); // Update lastDoc
      setLoading(false);
    } catch (e) {}
  };

  // Function to load more questions
  const loadMoreQuestions = async () => {
    if (loading || questions.length < 1) {
      return;
    } // Prevent loading more if already loading

    setLoading(true); // Set loading to true while fetching more questions

    try {
      const db = firestore;
      const ref = collection(db, "questions");

      const q = query(
        ref,
        where("direct", "==", false),
        where("deleted", "==", false),
        orderBy("dateCreated", "desc"),
        limit(20),
        startAfter(lastDoc)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length < 1) {
        setLoading(false);
        return;
      }

      const documents = [];

      for (let i = 0; i < querySnapshot.docs.length; i++) {
        let uid = querySnapshot.docs[i].get("uid");
        let user = await getDoc(doc(db, "users", uid));
        let meta = await getDoc(
          doc(
            db,
            `questions/${querySnapshot.docs[i].id}/meta/${querySnapshot.docs[i].id}`
          )
        );

        documents.push({
          answerCount: meta.get("answer_count"),
          askerPic: user.get("profilePic"),
          askerUsername: user.get("username"),
          askerName: user.get("displayName"),
          dateCreated: {
            _seconds: querySnapshot.docs[i].get("dateCreated").seconds,
            _nanoseconds: querySnapshot.docs[i].get("dateCreated").nanoseconds,
          },
          questionId: querySnapshot.docs[i].id,
          questionImage: querySnapshot.docs[i].get("questionImage"),
          questionText: querySnapshot.docs[i].get("questionText"),
          questionDeleted: querySnapshot.docs[i].get("deleted"),
          uid: user.id,
        });
      }

      setQuestions((prev) => [...prev, ...documents]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false); // Set loading to false after fetching more questions
    } catch (e) {
      // Handle errors
      setLoading(false); // Make sure to set loading to false in case of errors
    }
  };

  return (
    <QuestionContext.Provider
      value={{
        questions,
        addQuestions,
        loading,
        setLoading,
        loadMoreQuestions,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
}
