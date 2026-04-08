import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { GlassCard } from "@/app/components/GlassCard";
import { ProgressIndicator } from "@/app/components/ProgressIndicator";
import { PageTransition } from "@/app/components/PageTransition";
import { User, Mail, Lock } from "lucide-react";

export function CreateAccountPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/questionnaire");
  };

  return (
    <PageTransition direction="left">
      <div className="min-h-screen bg-[#fbf3fe] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ProgressIndicator currentStep={1} totalSteps={4} />

          <GlassCard>
            <div className="text-center mb-8">
              <h2 className="text-4xl text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Begin your personalized skin journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b63d3]" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b63d3]" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b63d3]" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12"
                  required
                />
              </div>

              <Button type="submit" glow className="w-full">
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#8b63d3] hover:underline"
                  onClick={() => navigate("/")}
                >
                  Sign In
                </button>
              </p>
            </form>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
