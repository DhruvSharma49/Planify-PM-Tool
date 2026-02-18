import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../utils/API";
import Navbar from "../components/Navbar";

export default function CreateTask() {
  const { id } = useParams();
  const [data, setData] = useState({ title: "", description: "" });

  const create = async () => {
    await API.post("/tasks", { ...data, projectId: id });
    window.history.back();
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Create Task</h2>
        <input className="border p-2 w-full mb-2" placeholder="Task Title"
          onChange={e => setData({ ...data, title: e.target.value })}
        />
        <textarea className="border p-2 w-full mb-4" placeholder="Description"
          onChange={e => setData({ ...data, description: e.target.value })}
        />
        <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Task
        </button>
      </div>
    </>
  );
}
