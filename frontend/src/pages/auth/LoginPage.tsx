import { ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch {
      setError("Invalid email or password. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-obsidian-canvas px-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border rounded-2xl p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div> */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true}/>
          </div>
          {/* <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            DispatchPulse
          </h1> */}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time service health & AI incident triage workspace
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form action="" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="responder@dispatchpulse.internal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder=".............."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In to Workspace
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Demo Quick-Fill Helpers */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-obsidian-border">
          <p className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider mb-3">
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
    </div>
  );
};
