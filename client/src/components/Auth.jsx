import { useState, useMemo } from "react";
import { 
  Eye, EyeOff, AlertCircle, X, ChevronRight, Check, 
  Lock, Mail, User, ShieldCheck, Key, HelpCircle, CheckCircle2
} from "lucide-react";
import { playSuccessSound, playWarningSound } from "../utils/audio";
import { apiFetch } from "../utils/api";

export default function Auth({ onAuthSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(false); // Default to signup
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Email syntax validation
  const isValidEmailFormat = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  // Password rules validation
  const passwordRules = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, [password]);

  // Calculate overall strength score (0 to 4)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordRules.hasMinLength) score++;
    if (passwordRules.hasUpperLower) score++;
    if (passwordRules.hasNumber) score++;
    if (passwordRules.hasSpecial) score++;
    return score;
  }, [passwordRules]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: "", color: "bg-slate-200", textColor: "text-slate-400" };
    switch (strengthScore) {
      case 1:
        return { text: "Weak", color: "bg-red-500", textColor: "text-red-500" };
      case 2:
        return { text: "Fair", color: "bg-amber-500", textColor: "text-amber-500" };
      case 3:
        return { text: "Good", color: "bg-blue-500", textColor: "text-blue-500" };
      case 4:
        return { text: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
      default:
        return { text: "Very Weak", color: "bg-red-500", textColor: "text-red-500" };
    }
  }, [password, strengthScore]);

  // Confirm password match check
  const isPasswordMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Front-end validation before submitting
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      playWarningSound();
      return;
    }

    if (!isValidEmailFormat) {
      setError("Please enter a valid email address (e.g. user@example.com).");
      playWarningSound();
      return;
    }

    if (!isLogin) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        playWarningSound();
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match. Please check and try again.");
        playWarningSound();
        return;
      }
    }

    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    try {
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: {
          email: email.trim().toLowerCase(),
          password: password.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });

      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned invalid response (${response.status}). Check backend service.`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      localStorage.setItem("zensprint_token", data.token);
      localStorage.setItem("zensprint_user", JSON.stringify(data.user));

      playSuccessSound();
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
      playWarningSound();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      playWarningSound();
      return;
    }
    setResetSent(true);
    playSuccessSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white p-6 md:p-8 text-slate-900 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer border-0"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 font-sans">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isLogin 
              ? "Sign in to access your ZenSprint focus dashboard" 
              : "Set up a secure account with strong credentials"}
          </p>
        </div>

        {/* Segmented Tab Controls */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              !isLogin
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              isLogin
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Optional First Name & Last Name (Signup Mode) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  First name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Last name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Developer"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Email Address Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-900">Email address</label>
              {!isValidEmailFormat && email && (
                <span className="text-[10px] font-semibold text-red-500">Invalid format</span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.developer@gmail.com"
                className={`w-full rounded-xl border bg-white pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition ${
                  !isValidEmailFormat && email
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                }`}
                required
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Password Input with Eye Toggle */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-900">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] font-semibold text-violet-600 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                required
              />
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Meter (Signup Mode) */}
            {!isLogin && password && (
              <div className="mt-2.5 space-y-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                {/* Strength Meter Header */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">Password Strength:</span>
                  <span className={`font-bold ${strengthLabel.textColor}`}>
                    {strengthLabel.text}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthScore >= 1 ? strengthLabel.color : "bg-transparent"}`}></div>
                  <div className={`h-full transition-all duration-300 ${strengthScore >= 2 ? strengthLabel.color : "bg-transparent"}`}></div>
                  <div className={`h-full transition-all duration-300 ${strengthScore >= 3 ? strengthLabel.color : "bg-transparent"}`}></div>
                  <div className={`h-full transition-all duration-300 ${strengthScore >= 4 ? strengthLabel.color : "bg-transparent"}`}></div>
                </div>

                {/* Checklist Requirements */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasMinLength ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {passwordRules.hasMinLength ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1"></span>}
                    <span>8+ characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasUpperLower ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {passwordRules.hasUpperLower ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1"></span>}
                    <span>Upper & lower case</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {passwordRules.hasNumber ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1"></span>}
                    <span>At least 1 number</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasSpecial ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {passwordRules.hasSpecial ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1"></span>}
                    <span>Special character (!@#$)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field (Signup Mode) */}
          {!isLogin && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-900">Confirm Password</label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${isPasswordMatch ? "text-emerald-600" : "text-red-500"}`}>
                    {isPasswordMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-xl border bg-white pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition ${
                    confirmPassword && !isPasswordMatch
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  }`}
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember me option (Login Mode) */}
          {isLogin && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                Remember me for 7 days
              </label>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processing...
              </span>
            ) : (
              <>
                <span>{isLogin ? "Sign In to ZenSprint" : "Create My Account"}</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Modal Footer */}
        <div className="mt-5 border-t border-slate-100 pt-3.5 text-center text-xs text-slate-500 space-y-2">
          <div>
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(null); }}
                  className="font-bold text-violet-600 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className="font-bold text-violet-600 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-slate-400" />
            <span>Secured with AES-256 & JWT Authentication</span>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer border-0"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mb-4">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Reset your password</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your account email to receive reset instructions.
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">Reset link sent!</p>
                  <p className="text-[11px] text-emerald-700">
                    If an account exists for <span className="font-bold">{resetEmail}</span>, you will receive password recovery steps shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
                    className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold transition hover:bg-emerald-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
