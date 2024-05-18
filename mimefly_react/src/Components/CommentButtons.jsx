import { ChatBubbleOutlineOutlined, Reply } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";

export default function CommentButtons(){
    return(
        <div style={{display:'flex', justifyContent:'flex-end'}}>
            <IconButton><Reply/></IconButton>
            <IconButton><ChatBubbleOutlineOutlined/></IconButton>
        </div>
    );
}