import { ArrowRight, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, Navigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";

interface LoginPageProps {
  defaultMode?: "login" | "register";
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();

  const isRegisterParam = searchParams.get("mode") === "register";
  const isRegisterRoute =
    location.pathname === "/register" ||
    defaultMode === "register" ||
    isRegisterParam;

  const [mode, setMode] = useState<"login" | "register">(
    isRegisterRoute ? "register" : "login"
  );

  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    if (newMode === "register") {
      setSearchParams({ mode: "register" });
    } else {
      setSearchParams({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        if (!orgName.trim()) {
          setError("Company / Organization name is required.");
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setIsLoading(false);
          return;
        }
        await register({
          org_name: orgName.trim(),
          email: email.trim(),
          password,
        });
      }
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: Record<string, unknown> } };
        const data = axiosErr.response?.data;
        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          const msg = Array.isArray(val) ? val[0] : val;
          if (typeof msg === "string") {
            setError(msg);
            setIsLoading(false);
            return;
          }
        }
      }
      setError(
        mode === "login"
          ? "Invalid email or password. Please verify your credentials."
          : "Failed to register organization. Please check your inputs and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    handleModeChange("login");
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-obsidian-canvas px-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border rounded-2xl p-8 shadow-xl">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex justify-center mb-4">
            <Link to="/" title="DispatchPulse Home" className="hover:opacity-90 transition-opacity">
              <Logo size="lg" showText={true} />
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {mode === "register"
              ? "Register your organization to launch an incident command workspace"
              : "Real-time service health & AI incident triage workspace"}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-100 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-obsidian-card text-indigo-600 dark:text-cyan-400 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("register")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white dark:bg-obsidian-card text-indigo-600 dark:text-cyan-400 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Register Org
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Dynamic Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1">
              <Input
                label="Company / Organization Name"
                type="text"
                required
                placeholder="e.g. Acme Corp, Stripe, Linear"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                A public status page and API key will be auto-provisioned.
              </p>
            </div>
          )}

          <Input
            label={mode === "register" ? "Admin Work Email" : "Email Address"}
            type="email"
            required
            placeholder={
              mode === "register"
                ? "sre-lead@company.com"
                : "responder@dispatchpulse.internal"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label={
              mode === "register" ? "Master Password (min 8 characters)" : "Password"
            }
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            <span>
              {mode === "register"
                ? "Create Organization & Launch Console"
                : "Sign In to Workspace"}
            </span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Footer Navigation / Demo Helpers */}
        {mode === "register" ? (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-obsidian-border text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Already registered? </span>
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer ml-1"
            >
              Sign In here
            </button>
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-obsidian-border space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                New company joining?
              </span>
              <button
                type="button"
                onClick={() => handleModeChange("register")}
                className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                Register Organization &rarr;
              </button>
            </div>

            {/* Demo Quick-Fill Helpers */}
            <div className="pt-2">
              <p className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider mb-2.5">
                Quick Fill Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin@dispatchpulse.local")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-border text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
                >
                  Admin Lead
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill("alex.chen@dispatchpulse.local")
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-border text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
                >
                  On-Call SRE (ALEX)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
