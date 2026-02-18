import React, { useState, useEffect } from "react";
import api from "../utils/API";
import { useParams } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import { io } from "socket.io-client";

export default function ProjectBoard() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const socket = io("http://localhost:5000", { withCredentials: true });

  const fetchTasks = async () => {
    const res = await api.get(`/tasks/${id}`);
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
    socket.emit("joinProject", id);
    socket.on("taskUpdated", data => fetchTasks());
    return () => { socket.disconnect(); };
  }, [id]);

  const createTask = async () => {
    await api.post("/tasks", { title, description: desc, project: id });
    socket.emit("taskUpdated", { projectId: id });
    setTitle(""); setDesc("");
  };

  return (
    <div>
      <h2>Project Board</h2>
      <input placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
      <button onClick={createTask}>Add Task</button>

      <div>
        {tasks.map(task => <TaskCard key={task._id} task={task} projectId={id} socket={socket} />)}
      </div>
    </div>
  );
}
