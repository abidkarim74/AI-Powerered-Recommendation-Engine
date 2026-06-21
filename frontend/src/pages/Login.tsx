import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; global?: string }>({});

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6) newErrors.password = "At least 6 characters.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (error: any) {
      setErrors({ global: error.message || "Failed to login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-9">

        <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1 text-center">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-7 text-center">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="username"
                type="text"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
                autoComplete="username"
                className={`w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 bg-white border rounded-lg outline-none transition-colors placeholder:text-gray-300
                  ${errors.username ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-gray-400"}`}
              />
            </div>
            {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                autoComplete="current-password"
                className={`w-full pl-9 pr-10 py-2.5 text-sm text-gray-900 bg-white border rounded-lg outline-none transition-colors placeholder:text-gray-300
                  ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-gray-400"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                    <path d="M3 3l14 14M8.5 8.7A3 3 0 0 0 11.3 11.5M6.2 5.4C4.2 6.7 2.7 8.7 2 10c1.3 3 4.5 5 8 5a9 9 0 0 0 3.8-.8M10 5c3.5 0 6.7 2 8 5a11 11 0 0 1-2.2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>

          {errors.global && <p className="text-xs text-red-500 text-center">{errors.global}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-1 py-2.5 px-4 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-gray-900 font-medium hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}