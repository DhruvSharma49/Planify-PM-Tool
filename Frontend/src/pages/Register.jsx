// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function RegisterPage() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
//     setLoading(true);
//     try {
//       await register(name, email, password);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4">
//       <div className="absolute inset-0 opacity-20" style={{
//         backgroundImage: 'linear-gradient(rgba(124,58,237,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.15) 1px, transparent 1px)',
//         backgroundSize: '48px 48px'
//       }} />

//       <div className="relative w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center gap-3 mb-4">
//             <div className="w-10 h-10 bg-gradient-to-br- from-violet-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
//               <span className="text-white font-display font-bold text-lg">P</span>
//             </div>
//             <span className="font-display font-bold text-white text-2xl tracking-tight">Planify</span>
//           </div>
//           <h1 className="font-display text-3xl font-bold text-white">Get started</h1>
//           <p className="text-slate-400 mt-2">Create your free workspace</p>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/50">
//           {error && (
//             <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-slide-in">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 placeholder="Alex Johnson"
//                 className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="you@example.com"
//                 className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="At least 6 characters"
//                 className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gradient-to-r- from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 mt-2"
//             >
//               {loading ? 'Creating account...' : 'Create account'}
//             </button>
//           </form>

//           <p className="text-center text-sm text-slate-400 mt-5">
//             Already have an account?{' '}
//             <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);

      // Fetch user after registration
      await checkAuth();

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.15) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br- from-violet-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-display font-bold text-lg">P</span>
            </div>
            <span className="font-display font-bold text-white text-2xl tracking-tight">Planify</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Get started</h1>
          <p className="text-slate-400 mt-2">Create your free workspace</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-slide-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Johnson"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r- from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
