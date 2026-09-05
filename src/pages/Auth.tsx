import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX, Sparkles, Star, Heart } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fdf2f8] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="glowup-blob glowup-blob-pink w-[350px] h-[350px] -top-40 -right-40" />
      <div className="glowup-blob glowup-blob-lavender w-[250px] h-[250px] bottom-20 -left-28" />

      {/* Back to landing */}
      <div className="absolute top-5 left-6 z-10">
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
          onClick={() => navigate("/")}
        >
          ← GlowUp
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8 relative">
          <div className="w-16 h-16 rounded-full glowup-gradient flex items-center justify-center shadow-lg shadow-pink-200/50">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 right-[calc(50%-40px)] w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </motion.div>
        </div>

        {step === "signIn" ? (
          <div className="glowup-card p-8">
            <h1 className="text-2xl font-bold text-center text-[#3f3043]">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1.5">
              Your glow is waiting for you to show
            </p>

            <form onSubmit={handleEmailSubmit} className="mt-7 space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-pink-300" />
                <Input
                  name="email"
                  placeholder="Enter email"
                  type="email"
                  className="pl-10 h-12 bg-pink-50/70 border-pink-100 rounded-xl focus-visible:ring-pink-300 focus-visible:border-pink-300"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold rounded-xl glowup-gradient border-0 shadow-md shadow-pink-200/30 hover:shadow-lg hover:shadow-pink-200/40 transition-shadow text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-pink-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-pink-300 font-medium">
                  Or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-sm rounded-xl border-pink-100 text-muted-foreground hover:bg-pink-50 hover:text-pink-600"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <UserX className="mr-2 h-4 w-4" />
              Continue as Guest
            </Button>
          </div>
        ) : (
          <div className="glowup-card p-8">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-5 h-5 text-pink-400" />
            </div>
            <h1 className="text-xl font-bold text-center text-[#3f3043]">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1.5">
              We sent a code to{" "}
              <span className="text-pink-500 font-medium">{step.email}</span>
            </p>

            <form onSubmit={handleOtpSubmit} className="mt-7">
              <input type="hidden" name="email" value={step.email} />
              <input type="hidden" name="code" value={otp} />

              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      otp.length === 6 &&
                      !isLoading
                    ) {
                      const form = (e.target as HTMLElement).closest("form");
                      if (form) form.requestSubmit();
                    }
                  }}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-11 h-12 rounded-xl border-pink-100 bg-pink-50/50"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-400 text-center">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold mt-6 rounded-xl glowup-gradient border-0 shadow-md shadow-pink-200/30 hover:shadow-lg hover:shadow-pink-200/40 transition-shadow text-white"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full mt-3 text-sm text-pink-400 hover:text-pink-500 hover:bg-pink-50"
                onClick={() => setStep("signIn")}
                disabled={isLoading}
              >
                Use different email
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
