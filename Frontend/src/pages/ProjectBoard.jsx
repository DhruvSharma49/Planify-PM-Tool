


import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/API";
import { useParams } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import { getSocket } from "../utils/socket";

export default function ProjectBoard() {

  const { id } = useParams();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const socket = getSocket();

  const fetchTasks = useCallback(async () => {
    try {

      const res = await api.get(`/tasks/${id}`);

      setTasks(res.data);

    } catch (err) {
      console.log(err);
    }
  }, [id]);

  useEffect(() => {

    fetchTasks();

    // join room
    socket.emit("joinProject", id);

    // listeners
    const handleTaskUpdated = () => {
      fetchTasks();
    };

    socket.on("taskUpdated", handleTaskUpdated);

    // cleanup
    return () => {

      socket.emit("leaveProject", id);

      socket.off("taskUpdated", handleTaskUpdated);

    };

  }, [id, fetchTasks]);

  const createTask = async () => {

    try {

      await api.post("/tasks", {
        title,
        description: desc,
        project: id
      });

      socket.emit("taskUpdated", {
        projectId: id
      });

      setTitle("");
      setDesc("");

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>

      <h2>Project Board</h2>

      <input
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <button onClick={createTask}>
        Add Task
      </button>

      <div>
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            projectId={id}
            socket={socket}
          />
        ))}
      </div>

    </div>
  );
}
