import React, { useState, useEffect } from "react";
import api from "../utils/API";

export default function CommentBox({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const res = await api.get(`/comments/${taskId}`);
    setComments(res.data);
  };

  useEffect(() => { fetchComments(); }, [taskId]);

  const addComment = async () => {
    await api.post("/comments", { task: taskId, content: text });
    setText("");
    fetchComments();
  };

  return (
    <div>
      {comments.map(c => <p key={c._id}><b>{c.author.name}:</b> {c.content}</p>)}
      <input placeholder="Add comment" value={text} onChange={e => setText(e.target.value)} />
      <button onClick={addComment}>Comment</button>
    </div>
  );
}
