import React from "react";
import Logo from "../assets/logo.png";

export default function Splash() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#00a8f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection:'column'
      }}
    >
      <div
        style={{
          backgroundImage: `url(${Logo})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100px 100px",
          width: '100px',
          height: '100px'
        }}
      ></div>
    </div>
  );
}
