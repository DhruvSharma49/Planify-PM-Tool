import { useState } from "react";
import API from "../utils/API";
import Navbar from "../components/Navbar";

export default function CreateProject() {
  const [data, setData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!data.name.trim()) return alert("Project name is required");

    try {
      setLoading(true);
      await API.post("/projects", data);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br-logo from-slate-900 via-gray-900 to-black text-white">
      <Navbar />

      <div className="flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <h2 className="text-2xl font-bold text-indigo-400 mb-1">
            Create New Project 🚀
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Start something awesome with your team
          </p>

          {/* Project Name */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 mb-1 block">
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. Task Management App"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setData({ ...data, name: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-sm text-gray-300 mb-1 block">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="What is this project about?"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
            />
          </div>

          {/* Button */}
          <button
            onClick={create}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
