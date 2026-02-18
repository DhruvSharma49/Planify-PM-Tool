import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../utils/API";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

export default function ProjectDetails() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    API.get(`/tasks/project/${id}`).then(res => setTasks(res.data));
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <Link to={`/create-task/${id}`} className="bg-green-600 text-white px-3 py-1 rounded">
          + Add Task
        </Link>
        <div className="mt-4 grid gap-3">
          {tasks.map(t => <TaskCard key={t._id} task={t} />)}
        </div>
      </div>
    </>
  );
}
