import React, { useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true);

  const toggle = () => setIsLogin(!isLogin);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isLogin ? <Login toggle={toggle} /> : <Register toggle={toggle} />}
    </div>
  );
}
