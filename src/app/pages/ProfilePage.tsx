import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { BackButton } from "../components/BackButton";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Shield,
  Bell,
  Heart,
  AlertCircle,
  Save,
  Camera,
  Lock,
  Key,
  Database,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  FileKey,
  Server,
  Globe,
} from "lucide-react";

function parseJwt(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeDate(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  birthday: string;
  address: string;
};

type QuestionnaireForm = {
  skinType: string;
  sensitivityLevel: string;
  symptoms: string[];
  affectedAreas: string[];
  concerns: string[];
  allergies: string;
  medicalHistory: string;
  duration: string;
  severity: string;
  triggers: string[];
  skincareRoutine: string;
  sunscreenUsage: string;
  stressLevel: string;
  sleepQuality: string;
  waterIntake: string;
};

const defaultQuestionnaire: QuestionnaireForm = {
  skinType: "",
  sensitivityLevel: "",
  symptoms: [],
  affectedAreas: [],
  concerns: [],
  allergies: "",
  medicalHistory: "",
  duration: "",
  severity: "",
  triggers: [],
  skincareRoutine: "",
  sunscreenUsage: "",
  stressLevel: "",
  sleepQuality: "",
  waterIntake: "",
};

const skinTypes = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];
const sensitivityLevels = ["Low", "Moderate", "High", "Very High"];

const symptomsOptions = [
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

const affectedAreasOptions = [
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

const concernsOptions = [
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

const triggersOptions = [
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

const durationsOptions = [
  "Less than 1 week",
  "1 to 4 weeks",
  "1 to 3 months",
  "More than 3 months",
  "Recurring problem",
];

const severityOptions = ["Mild", "Moderate", "Severe"];
const sunscreenOptions = ["Never", "Sometimes", "Often", "Every day"];
const stressOptions = ["Low", "Moderate", "High"];
const sleepOptions = ["Poor", "Average", "Good"];
const waterOptions = ["Less than 1L", "1-2L", "More than 2L"];

export function ProfilePage() {
  const navigate = useNavigate();
  const { token, username, roles, logout } = useAuth();

  const claims = useMemo(() => (token ? parseJwt(token) : {}), [token]);

  const firstNameFromToken = claims.given_name || "";
  const lastNameFromToken = claims.family_name || "";
  const emailFromToken =
    claims.email || claims.preferred_username || username || "";

  const [activeTab, setActiveTab] = useState<
    "personal" | "skin" | "security" | "notifications"
  >("personal");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSkinPrefs, setLoadingSkinPrefs] = useState(true);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    birthday: "",
    address: "",
  });

  const [skinPreferences, setSkinPreferences] =
    useState<QuestionnaireForm>(defaultQuestionnaire);

  const fullName =
    `${personalInfo.firstName} ${personalInfo.lastName}`.trim() ||
    username ||
    "Utilisateur";

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);
      setError("");

      const response = await fetch("http://localhost:3000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to load profile");
      }

      const data = await response.json();

      setPersonalInfo({
        firstName: data.firstName ?? firstNameFromToken,
        lastName: data.lastName ?? lastNameFromToken,
        email: data.email ?? emailFromToken,
        username: data.username ?? claims.preferred_username ?? username ?? "",
        phone: data.phone ?? "",
        birthday: normalizeDate(data.birthday),
        address: data.address ?? "",
      });
    } catch (err: any) {
      setError(err.message || "Unable to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }, [
    token,
    firstNameFromToken,
    lastNameFromToken,
    emailFromToken,
    claims.preferred_username,
    username,
  ]);

  const fetchQuestionnaire = useCallback(async () => {
    if (!token) {
      setLoadingSkinPrefs(false);
      return;
    }

    try {
      setLoadingSkinPrefs(true);

      const response = await fetch(
        "http://localhost:3000/users/questionnaire/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        setSkinPreferences(defaultQuestionnaire);
        return;
      }

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(rawText || "Failed to load questionnaire");
      }

      if (!rawText || rawText.trim() === "") {
        setSkinPreferences(defaultQuestionnaire);
        return;
      }

      const data = JSON.parse(rawText);

      if (!data) {
        setSkinPreferences(defaultQuestionnaire);
        return;
      }

      setSkinPreferences({
        skinType: data.skinType ?? "",
        sensitivityLevel: data.sensitivityLevel ?? "",
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        affectedAreas: Array.isArray(data.affectedAreas)
          ? data.affectedAreas
          : [],
        concerns: Array.isArray(data.concerns) ? data.concerns : [],
        allergies: data.allergies ?? "",
        medicalHistory: data.medicalHistory ?? "",
        duration: data.duration ?? "",
        severity: data.severity ?? "",
        triggers: Array.isArray(data.triggers) ? data.triggers : [],
        skincareRoutine: data.skincareRoutine ?? "",
        sunscreenUsage: data.sunscreenUsage ?? "",
        stressLevel: data.stressLevel ?? "",
        sleepQuality: data.sleepQuality ?? "",
        waterIntake: data.waterIntake ?? "",
      });
    } catch (err: any) {
      setError(err.message || "Unable to load skin preferences");
    } finally {
      setLoadingSkinPrefs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
    fetchQuestionnaire();
  }, [fetchProfile, fetchQuestionnaire]);

  const handleSave = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      if (activeTab === "skin") {
        const response = await fetch("http://localhost:3000/users/questionnaire", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...skinPreferences,
            triggers: Array.isArray(skinPreferences.triggers)
              ? skinPreferences.triggers
              : [],
            symptoms: Array.isArray(skinPreferences.symptoms)
              ? skinPreferences.symptoms
              : [],
            affectedAreas: Array.isArray(skinPreferences.affectedAreas)
              ? skinPreferences.affectedAreas
              : [],
            concerns: Array.isArray(skinPreferences.concerns)
              ? skinPreferences.concerns
              : [],
          }),
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
          throw new Error(
            data?.message || rawText || "Failed to save skin preferences"
          );
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        return;
      }

      const response = await fetch("http://localhost:3000/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          username: personalInfo.username,
          phone: personalInfo.phone,
          birthday: personalInfo.birthday,
          address: personalInfo.address,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save profile");
      }

      await fetchProfile();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Unexpected error while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) return;

    try {
      setPasswordLoading(true);
      setPasswordError("");
      setPasswordSuccess("");

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError("All password fields are required");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("New password and confirmation do not match");
        return;
      }

      if (newPassword.length < 8) {
        setPasswordError("New password must contain at least 8 characters");
        return;
      }

      if (currentPassword === newPassword) {
        setPasswordError(
          "New password must be different from current password"
        );
        return;
      }

      const response = await fetch("http://localhost:3000/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to change password"
        );
      }

      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err.message || "Unexpected error while changing password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "DELETE") {
      logout();
    }
  };

  const toggleQuestionnaireArray = (
    field: "symptoms" | "affectedAreas" | "concerns" | "triggers",
    value: string
  ) => {
    setSkinPreferences((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "skin", label: "Skin Preferences", icon: Heart },
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 py-12">
        <div className="max-w-5xl mx-auto">
          <BackButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl text-gray-800 mb-4">Account Settings</h1>
            <p className="text-gray-600 text-xl">
              Manage your profile and preferences
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <GlassCard className="flex items-center gap-6">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center text-white text-3xl font-bold">
                    {getInitials(fullName)}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <Camera className="w-4 h-4 text-[#8b63d3]" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl text-gray-800 mb-1 font-bold">
                  {fullName}
                </h3>
                <p className="text-gray-600">{personalInfo.email}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-[#8b63d3] font-semibold capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard className="p-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <tab.icon className="w-6 h-6" />
                    <span className="text-sm text-center font-semibold">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard>
              {activeTab === "personal" && (
                <div>
                  <h3 className="text-2xl text-gray-800 mb-6 flex items-center gap-2 font-bold">
                    <User className="w-6 h-6 text-[#8b63d3]" />
                    Personal Information
                  </h3>

                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#8b63d3] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      These values are loaded from the backend and refreshed
                      after save.
                    </p>
                  </div>

                  {loadingProfile ? (
                    <div className="py-10 text-center text-gray-500">
                      Loading profile...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          type="text"
                          value={personalInfo.firstName}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                        />
                        <Input
                          label="Last Name"
                          type="text"
                          value={personalInfo.lastName}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                        <Input
                          label="Username"
                          type="text"
                          value={personalInfo.username}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Phone"
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                        <Input
                          label="Birthday"
                          type="date"
                          value={personalInfo.birthday}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              birthday: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-sm mb-2 text-gray-700 font-semibold">
                          Address
                        </label>
                        <textarea
                          value={personalInfo.address}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all resize-none"
                          rows={3}
                          placeholder="Your address..."
                        />
                      </div>

                      {(claims.sub || claims.email_verified !== undefined) && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Keycloak Account Info
                          </p>

                          {claims.sub && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Key className="w-3 h-3" />
                              <span>
                                User ID :{" "}
                                <code className="bg-gray-100 px-1 rounded">
                                  {claims.sub}
                                </code>
                              </span>
                            </div>
                          )}

                          {claims.email_verified !== undefined && (
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle
                                className={`w-3 h-3 ${
                                  claims.email_verified
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              />
                              <span
                                className={
                                  claims.email_verified
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                Email{" "}
                                {claims.email_verified
                                  ? "verified"
                                  : "not verified"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "skin" && (
                <div>
                  <h3 className="text-2xl text-gray-800 mb-6 flex items-center gap-2 font-bold">
                    <Heart className="w-6 h-6 text-[#8b63d3]" />
                    Skin Preferences
                  </h3>

                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#8b63d3] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      These values are loaded from your questionnaire and can be
                      updated here using the same structure and options.
                    </p>
                  </div>

                  {loadingSkinPrefs ? (
                    <div className="py-10 text-center text-gray-500">
                      Loading skin preferences...
                    </div>
                  ) : (
                    <div className="space-y-8">
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
                                setSkinPreferences((prev) => ({
                                  ...prev,
                                  skinType: type,
                                }))
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.skinType === type
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
                                setSkinPreferences((prev) => ({
                                  ...prev,
                                  sensitivityLevel: level,
                                }))
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.sensitivityLevel === level
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
                          What symptoms are you experiencing? (Select all that
                          apply)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {symptomsOptions.map((symptom) => (
                            <motion.button
                              key={symptom}
                              type="button"
                              onClick={() =>
                                toggleQuestionnaireArray("symptoms", symptom)
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.symptoms.includes(symptom)
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
                          {affectedAreasOptions.map((area) => (
                            <motion.button
                              key={area}
                              type="button"
                              onClick={() =>
                                toggleQuestionnaireArray("affectedAreas", area)
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.affectedAreas.includes(area)
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
                          What are your main skin concerns? (Select all that
                          apply)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {concernsOptions.map((concern) => (
                            <motion.button
                              key={concern}
                              type="button"
                              onClick={() =>
                                toggleQuestionnaireArray("concerns", concern)
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.concerns.includes(concern)
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
                          {durationsOptions.map((item) => (
                            <motion.button
                              key={item}
                              type="button"
                              onClick={() =>
                                setSkinPreferences((prev) => ({
                                  ...prev,
                                  duration: item,
                                }))
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.duration === item
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
                          {severityOptions.map((level) => (
                            <motion.button
                              key={level}
                              type="button"
                              onClick={() =>
                                setSkinPreferences((prev) => ({
                                  ...prev,
                                  severity: level,
                                }))
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.severity === level
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
                          What factors seem to make it worse? (Select all that
                          apply)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {triggersOptions.map((trigger) => (
                            <motion.button
                              key={trigger}
                              type="button"
                              onClick={() =>
                                toggleQuestionnaireArray("triggers", trigger)
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                skinPreferences.triggers.includes(trigger)
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
                          value={skinPreferences.allergies}
                          onChange={(e) =>
                            setSkinPreferences((prev) => ({
                              ...prev,
                              allergies: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-4 font-semibold">
                          Do you have any medical history related to skin or
                          other health conditions?
                        </label>
                        <textarea
                          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all resize-none"
                          rows={3}
                          placeholder="Example: eczema, psoriasis, rosacea, hormonal imbalance, diabetes, thyroid issues..."
                          value={skinPreferences.medicalHistory}
                          onChange={(e) =>
                            setSkinPreferences((prev) => ({
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
                          value={skinPreferences.skincareRoutine}
                          onChange={(e) =>
                            setSkinPreferences((prev) => ({
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
                            value={skinPreferences.sunscreenUsage}
                            onChange={(e) =>
                              setSkinPreferences((prev) => ({
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
                            value={skinPreferences.stressLevel}
                            onChange={(e) =>
                              setSkinPreferences((prev) => ({
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
                            value={skinPreferences.sleepQuality}
                            onChange={(e) =>
                              setSkinPreferences((prev) => ({
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
                            value={skinPreferences.waterIntake}
                            onChange={(e) =>
                              setSkinPreferences((prev) => ({
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

                      <div className="bg-purple-50/50 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#8b63d3] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          These preferences are synchronized with your saved
                          questionnaire and can be updated here using the same
                          values and questions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl text-gray-800 mb-4 flex items-center gap-2 font-bold">
                      <Shield className="w-6 h-6 text-[#8b63d3]" />
                      Account Security
                    </h3>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3 mb-4">
                        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800 mb-1">
                            Change Password
                          </p>
                          <p className="text-sm text-blue-700">
                            Update your password securely from this page.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />

                        <Input
                          label="New Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {passwordError && (
                          <p className="text-sm text-red-600 font-medium">
                            {passwordError}
                          </p>
                        )}

                        {passwordSuccess && (
                          <p className="text-sm text-green-600 font-medium">
                            {passwordSuccess}
                          </p>
                        )}

                        <Button
                          onClick={handleChangePassword}
                          disabled={passwordLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Key className="w-4 h-4" />
                          {passwordLoading ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-8">
                    <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2 font-bold">
                      <Lock className="w-5 h-5 text-[#8b63d3]" />
                      Data Encryption & Security
                    </h3>
                    <div className="space-y-4">
                      <GlassCard className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <FileKey className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2">
                              AES-256 Encryption
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              All your personal data, skin analysis results, and
                              facial images are encrypted both in transit and at
                              rest.
                            </p>
                            <div className="flex items-center gap-2 text-emerald-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-semibold">
                                Your data is fully encrypted
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/50 border border-purple-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Server className="w-5 h-5 text-[#8b63d3]" />
                            <h5 className="font-semibold text-gray-800">
                              Secure Storage
                            </h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            Data stored on secure servers with regular security
                            audits.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/50 border border-purple-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-[#8b63d3]" />
                            <h5 className="font-semibold text-gray-800">
                              SSL/TLS Protection
                            </h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            All connections use SSL/TLS encryption.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-8">
                    <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2 font-bold">
                      <ShieldCheck className="w-5 h-5 text-[#8b63d3]" />
                      Privacy Assurance
                    </h3>
                    <div className="space-y-3">
                      {[
                        "We never sell your personal data to third parties",
                        "Your facial images are used only for AI analysis and are never shared",
                        "You have full control over your data and can delete it anytime",
                        "We comply with GDPR, CCPA, and international privacy laws",
                        "Anonymous analytics only",
                      ].map((text, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50"
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-[#8b63d3] flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">
                            What Data We Collect
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Account information</li>
                            <li>• Facial images for skin analysis</li>
                            <li>• Skin health data and progress tracking</li>
                            <li>• Product purchase history</li>
                            <li>• App usage analytics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-red-200 pt-8">
                    <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Danger Zone
                    </h3>
                    <GlassCard className="bg-red-50/50 border-2 border-red-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-2">
                            Delete My Account
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Permanently delete your account and all associated
                            data.
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowDeleteModal(true)}
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 whitespace-nowrap"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </Button>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h3 className="text-2xl text-gray-800 mb-6 flex items-center gap-2 font-bold">
                    <Bell className="w-6 h-6 text-[#8b63d3]" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Routine Reminders",
                        description:
                          "Get reminders for your daily skincare routine",
                        checked: true,
                      },
                      {
                        title: "Product Recommendations",
                        description:
                          "Receive personalized product suggestions",
                        checked: true,
                      },
                      {
                        title: "Order Updates",
                        description: "Track your orders and shipping status",
                        checked: true,
                      },
                      {
                        title: "Promotional Emails",
                        description:
                          "Special offers and exclusive discounts",
                        checked: false,
                      },
                      {
                        title: "Skin Progress Reports",
                        description:
                          "Weekly insights about your skin improvement",
                        checked: true,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 rounded-xl bg-white/30"
                      >
                        <div className="flex-1">
                          <p className="text-gray-800 mb-1 font-semibold">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            defaultChecked={item.checked}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b63d3]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b63d3]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <AnimatePresence>
                    {saved && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                          Changes saved successfully!
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  )}
                </div>

                <Button
                  glow
                  onClick={handleSave}
                  disabled={loading || loadingProfile || loadingSkinPrefs}
                  className="ml-auto flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <GlassCard className="bg-white border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Delete Account
                  </h3>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to delete your account? This action is{" "}
                    <strong>permanent</strong>.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    To confirm, type <strong>DELETE</strong> below:
                  </p>
                  <Input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "DELETE"}
                    className={`flex-1 ${
                      deleteConfirmation === "DELETE"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } text-white`}
                  >
                    Delete Permanently
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}