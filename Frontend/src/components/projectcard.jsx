import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/project/${project._id}`}>
      <div className="border p-4 rounded shadow hover:shadow-lg">
        <h3 className="font-bold">{project.name}</h3>
        <p className="text-sm">{project.description}</p>
      </div>
    </Link>
  );
}
