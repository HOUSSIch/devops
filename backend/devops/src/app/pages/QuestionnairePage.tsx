import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { markQuestionnaireComplete } from "../utils/questionnaire";

// ─── Décode le JWT pour extraire le sub ───────────────────────────────────
function parseJwt(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export function QuestionnairePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    skinType: "",
    sensitivityLevel: "",
    symptoms: [] as string[],
    affectedAreas: [] as string[],
    concerns: [] as string[],
    allergies: "",
    medicalHistory: "",
    duration: "",
    severity: "",
    triggers: [] as string[],
    skincareRoutine: "",
    sunscreenUsage: "",
    stressLevel: "",
    sleepQuality: "",
    waterIntake: "",
  });

  const skinTypes = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];

  const sensitivityLevels = ["Low", "Moderate", "High", "Very High"];

  const symptoms = [
    "Itching",
    "Burning",
    "Redness",
    "Flaking",
    "Pain",
    "Dry patches",
    "Pimples",
    "Cysts",
    "Swelling",
    "Tightness",
    "Rash",
    "Dark spots",
  ];

  const affectedAreas = [
    "Forehead",
    "Cheeks",
    "Nose",
    "Chin",
    "Jawline",
    "Neck",
    "Around eyes",
    "Whole face",
    "Scalp",
    "Body",
  ];

  const concerns = [
    "Acne",
    "Dark Spots",
    "Wrinkles",
    "Large Pores",
    "Dullness",
    "Redness",
    "Uneven Tone",
    "Dehydration",
    "Blackheads",
    "Whiteheads",
    "Sensitivity",
    "Early Aging",
  ];

  const triggers = [
    "Stress",
    "Sun exposure",
    "Weather change",
    "Hormonal changes",
    "New skincare products",
    "Diet",
    "Makeup",
    "Lack of sleep",
    "Pollution",
    "Menstrual cycle",
  ];

  const durations = [
    "Less than 1 week",
    "1 to 4 weeks",
    "1 to 3 months",
    "More than 3 months",
    "Recurring problem",
  ];

  const severities = ["Mild", "Moderate", "Severe"];

  const sunscreenOptions = ["Never", "Sometimes", "Often", "Every day"];
  const stressOptions = ["Low", "Moderate", "High"];
  const sleepOptions = ["Poor", "Average", "Good"];
  const waterOptions = ["Less than 1L", "1-2L", "More than 2L"];

  const toggleMultiSelect = (
    field: "symptoms" | "affectedAreas" | "concerns" | "triggers",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("You must be logged in");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:3000/users/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const rawText = await response.text();
      let data: any = null;

      if (rawText && rawText.trim() !== "") {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || rawText || "Failed to save questionnaire");
      }

      const claims = parseJwt(token);
      const sub = claims.sub as string | undefined;

      if (sub) {
        markQuestionnaireComplete(sub);
      }

      localStorage.setItem("skinQuestionnaire", JSON.stringify(formData));
      navigate("/upload");
    } catch (err: any) {
      setError(err.message || "Failed to save questionnaire");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.skinType &&
    formData.sensitivityLevel &&
    formData.symptoms.length > 0 &&
    formData.affectedAreas.length > 0 &&
    formData.concerns.length > 0 &&
    formData.duration &&
    formData.severity;

  return (
    <PageTransition direction="left">
      <div className="min-h-screen bg-[#fbf3fe] flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <ProgressIndicator currentStep={2} totalSteps={4} />

          <GlassCard>
            <div className="text-center mb-8">
              <h2 className="text-4xl text-gray-800 mb-2">
                Skin Health Questionnaire
              </h2>
              <p className="text-gray-600">
                Help us better understand your skin condition, symptoms, and
                daily habits for a more accurate analysis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  What is your skin type?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skinTypes.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          skinType: type,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.skinType === type
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  How sensitive is your skin?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sensitivityLevels.map((level) => (
                    <motion.button
                      key={level}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sensitivityLevel: level,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.sensitivityLevel === level
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  What symptoms are you experiencing? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {symptoms.map((symptom) => (
                    <motion.button
                      key={symptom}
                      type="button"
                      onClick={() => toggleMultiSelect("symptoms", symptom)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.symptoms.includes(symptom)
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {symptom}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  Which areas are affected? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {affectedAreas.map((area) => (
                    <motion.button
                      key={area}
                      type="button"
                      onClick={() => toggleMultiSelect("affectedAreas", area)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.affectedAreas.includes(area)
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {area}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  What are your main skin concerns? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {concerns.map((concern) => (
                    <motion.button
                      key={concern}
                      type="button"
                      onClick={() => toggleMultiSelect("concerns", concern)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.concerns.includes(concern)
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {concern}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  Since when do you have this issue?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {durations.map((item) => (
                    <motion.button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: item,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.duration === item
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  How severe is the condition?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {severities.map((level) => (
                    <motion.button
                      key={level}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          severity: level,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.severity === level
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  What factors seem to make it worse? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {triggers.map((trigger) => (
                    <motion.button
                      key={trigger}
                      type="button"
                      onClick={() => toggleMultiSelect("triggers", trigger)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.triggers.includes(trigger)
                          ? "border-[#8b63d3] bg-[#8b63d3] text-white"
                          : "border-purple-200 bg-white/30 text-gray-700 hover:border-[#8b63d3]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {trigger}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  Do you have any allergies or sensitivities?
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all resize-none"
                  rows={3}
                  placeholder="Example: fragrance, retinol, acids, certain ingredients..."
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allergies: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  Do you have any medical history related to skin or other health conditions?
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all resize-none"
                  rows={3}
                  placeholder="Example: eczema, psoriasis, rosacea, hormonal imbalance, diabetes, thyroid issues..."
                  value={formData.medicalHistory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      medicalHistory: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4 font-semibold">
                  Describe your current skincare routine
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all resize-none"
                  rows={3}
                  placeholder="Example: cleanser, moisturizer, serum, sunscreen, exfoliant..."
                  value={formData.skincareRoutine}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      skincareRoutine: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-4 font-semibold">
                    How often do you use sunscreen?
                  </label>
                  <select
                    value={formData.sunscreenUsage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sunscreenUsage: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20"
                  >
                    <option value="">Select an option</option>
                    {sunscreenOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-4 font-semibold">
                    Stress level
                  </label>
                  <select
                    value={formData.stressLevel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stressLevel: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20"
                  >
                    <option value="">Select an option</option>
                    {stressOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-4 font-semibold">
                    Sleep quality
                  </label>
                  <select
                    value={formData.sleepQuality}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sleepQuality: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20"
                  >
                    <option value="">Select an option</option>
                    {sleepOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-4 font-semibold">
                    Daily water intake
                  </label>
                  <select
                    value={formData.waterIntake}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        waterIntake: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20"
                  >
                    <option value="">Select an option</option>
                    {waterOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-800">
                  This questionnaire helps personalize the AI analysis, but it
                  does not replace a medical diagnosis. Some skin symptoms may
                  overlap with other dermatological or systemic conditions.
                </p>
              </div>

              <Button
                type="submit"
                glow
                className="w-full"
                disabled={!isFormValid}
              >
                Continue to Upload
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}