import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/API";
import { useAuth } from "../context/AuthContext";
import CreateProjectModal from "../components/CreatePostModal";
import Avatar from "../components/Avatar";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from "date-fns";

import {
  FiPlus,
  FiFolder,
  FiUsers,
  FiTrendingUp,
  FiArrowUpRight,
} from "react-icons/fi";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="flex-1 overflow-y-auto p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-black min-h-screen"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`
        .dashboard-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* HEADER */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {greeting},{" "}
            <span className="text-violet-400">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-2xl transition-all shadow-lg hover:shadow-violet-500/30"
        >
          <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          New Project
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            label: "Total Projects",
            value: projects.length,
            icon: <FiFolder />,
          },
          {
            label: "Active Projects",
            value: projects.filter((p) => !p.isArchived).length,
            icon: <FiTrendingUp />,
          },
          {
            label: "Collaborating",
            value: projects.filter((p) => p.owner._id !== user?._id).length,
            icon: <FiUsers />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 shadow-lg hover:border-violet-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl text-violet-400">{stat.icon}</div>
              <div className="w-10 h-10 rounded-xl bg-slate-800" />
            </div>

            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* PROJECTS */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-6 tracking-wide">
          Your Projects
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/60 border border-dashed border-slate-700 rounded-3xl backdrop-blur-lg">
            <FiFolder className="text-5xl text-slate-500 mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No projects yet
            </h3>
            <p className="text-slate-400 mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="group bg-slate-900/60 backdrop-blur-xl border border-slate-700 hover:border-violet-500/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10"
              >
                {/* Animated Top Color Line */}
                <div
                  className="h-1 w-14 rounded-full mb-4 transition-all duration-300 ease-out group-hover:w-24"
                  style={{ backgroundColor: project.color }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {project.owner._id === user?._id
                          ? "Owner"
                          : `by ${project.owner.name}`}
                      </p>
                    </div>
                  </div>

                  <FiArrowUpRight className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                </div>

                {project.description && (
                  <p className="text-sm text-slate-400 mb-5 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((m) => (
                      <Avatar
                        key={m.user._id}
                        user={m.user}
                        size="xs"
                        className="ring-2 ring-slate-900"
                      />
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 ring-2 ring-slate-900 flex items-center justify-center text-xs text-slate-400">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-slate-500">
                    {format(new Date(project.updatedAt), "MMM d")}
                  </span>
                </div>
              </Link>
            ))}

            {/* CREATE CARD */}
            <button
              onClick={() => setShowCreate(true)}
              className="group bg-slate-900/60 border border-dashed border-slate-700 hover:border-violet-500/40 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg hover:shadow-violet-500/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-violet-600/20 flex items-center justify-center transition-all">
                <FiPlus className="text-xl text-slate-400 group-hover:text-violet-400 transition-all" />
              </div>

              <span className="text-sm text-slate-400 group-hover:text-violet-400 font-medium transition-colors">
                New Project
              </span>
            </button>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}
