import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

interface Fields {
  fullName: string;
  username: string;
  email: string;
  password: string;
  retypePassword: string;
}

interface Errors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  retypePassword?: string;
}

type FieldProps = {
  id: keyof Fields;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon: React.ReactNode;
  toggle?: React.ReactNode;
};

function Field({ id, label, type, placeholder, autoComplete, value, onChange, error, icon, toggle }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">{icon}</span>
        <input
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete}
          className={`w-full pl-9 ${toggle ? "pr-9" : "pr-3"} py-2 text-sm text-gray-900 bg-white border rounded-lg outline-none transition-colors placeholder:text-gray-300
            ${error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-gray-400"}`}
        />
        {toggle}
      </div>
      {error && <p className="text-xs text-red-400 leading-tight">{error}</p>}
    </div>
  );
}

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M3 3l14 14M8.5 8.7A3 3 0 0 0 11.3 11.5M6.2 5.4C4.2 6.7 2.7 8.7 2 10c1.3 3 4.5 5 8 5a9 9 0 0 0 3.8-.8M10 5c3.5 0 6.7 2 8 5a11 11 0 0 1-2.2 3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>({ fullName: "", username: "", email: "", password: "", retypePassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors & { global?: string }>({});

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): Errors => {
    const errs: Errors = {};
    if (!fields.fullName.trim()) errs.fullName = "Full name is required.";
    if (!fields.username.trim()) errs.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]{3,}$/.test(fields.username)) errs.username = "Min 3 chars — letters, numbers, underscores.";
    if (!fields.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "Enter a valid email address.";
    if (!fields.password) errs.password = "Password is required.";
    else if (fields.password.length < 8) errs.password = "At least 8 characters.";
    if (!fields.retypePassword) errs.retypePassword = "Please confirm your password.";
    else if (fields.password !== fields.retypePassword) errs.retypePassword = "Passwords don't match.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await signup(fields.fullName, fields.username, fields.email, fields.password);
      navigate("/");
    } catch (error: any) {
      setErrors({ global: error.message || "Failed to create account" });
    } finally {
      setLoading(false);
    }
  };

  const eyeToggle = (show: boolean, toggle: () => void, label: string) => (
    <button type="button" onClick={toggle} aria-label={label}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
      <EyeIcon open={show} />
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-8">

        <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1 text-center">Create an account</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Fill in your details to get started</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

          <Field id="fullName" label="Full name" type="text" placeholder="Jane Smith" autoComplete="name"
            value={fields.fullName} onChange={set("fullName")} error={errors.fullName}
            icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          />

          <Field id="username" label="Username" type="text" placeholder="jane_smith" autoComplete="username"
            value={fields.username} onChange={set("username")} error={errors.username}
            icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 10l1.5 1.5L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />

          <Field id="email" label="Email" type="email" placeholder="jane@example.com" autoComplete="email"
            value={fields.email} onChange={set("email")} error={errors.email}
            icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field id="password" label="Password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password"
              value={fields.password} onChange={set("password")} error={errors.password}
              icon={<LockIcon />}
              toggle={eyeToggle(showPassword, () => setShowPassword(v => !v), showPassword ? "Hide password" : "Show password")}
            />
            <Field id="retypePassword" label="Confirm password" type={showRetype ? "text" : "password"} placeholder="••••••••" autoComplete="new-password"
              value={fields.retypePassword} onChange={set("retypePassword")} error={errors.retypePassword}
              icon={<LockIcon />}
              toggle={eyeToggle(showRetype, () => setShowRetype(v => !v), showRetype ? "Hide password" : "Show password")}
            />
          </div>

          {errors.global && <p className="text-xs text-red-500 text-center">{errors.global}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-1 py-2.5 px-4 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating account…
              </>
            ) : (
              <>
                Create account
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-gray-900 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}