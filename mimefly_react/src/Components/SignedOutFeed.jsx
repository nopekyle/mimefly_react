import React, {useRef, useEffect} from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
import Question from "./Question";
import { Typography } from "@mui/material";
import { useQuestionContext } from "../SignedOutContext";

function SignedOutFeed() {
  const { questions, addQuestions, loading, setLoading, loadMoreQuestions } = useQuestionContext();
  const sentinelRef = useRef(null);


  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {   
        // When the sentinel enters the viewport and not already loading,
        // trigger the loading of more posts.
        loadMoreQuestions();
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
  }, [sentinelRef, loading, loadMoreQuestions]);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div>
        {questions.map((q, i) => {
          return <Question embedded={false} questions={q} questionId={q.questionId} key={i} />;
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

export default SignedOutFeed;
