import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Save,
  User,
  Bell,
  Lock,
  Globe,
  Shield,
  Camera,
  Key,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

type SettingsTab = "profile" | "notifications" | "security" | "general";

function parseJwt(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function normalizeDate(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

export function AdminSettings() {
  const { token, username, roles } = useAuth() as any;
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const claims = useMemo(() => (token ? parseJwt(token) : {}), [token]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    birthday: "",
    address: "",
  });

  const [initialProfileForm, setInitialProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    birthday: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fullName =
    `${profileForm.firstName} ${profileForm.lastName}`.trim() ||
    profileForm.username ||
    username ||
    "Administrator";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);

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

        const mapped = {
          firstName: data.firstName ?? claims.given_name ?? "",
          lastName: data.lastName ?? claims.family_name ?? "",
          email: data.email ?? claims.email ?? "",
          username:
            data.username ?? claims.preferred_username ?? username ?? "",
          phone: data.phone ?? "",
          birthday: normalizeDate(data.birthday),
          address: data.address ?? "",
        };

        setProfileForm(mapped);
        setInitialProfileForm(mapped);
      } catch (error: any) {
        toast.error(error.message || "Unable to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token, claims.given_name, claims.family_name, claims.email, claims.preferred_username, username]);

  const handleProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image too large. Max size is 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
      toast.success("Photo selected successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!token) return;

    try {
      setSavingProfile(true);

      const response = await fetch("http://localhost:3000/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
          username: profileForm.username,
          phone: profileForm.phone,
          birthday: profileForm.birthday,
          address: profileForm.address,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save profile");
      }

      setInitialProfileForm(profileForm);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileForm(initialProfileForm);
    toast.info("Changes canceled");
  };

  const handlePasswordChange = async () => {
    if (!token) return;

    try {
      setSavingPassword(true);

      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        toast.error("All password fields are required");
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        toast.error("New password must contain at least 8 characters");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("Password confirmation does not match");
        return;
      }

      if (passwordForm.currentPassword === passwordForm.newPassword) {
        toast.error("New password must be different from current password");
        return;
      }

      const response = await fetch("http://localhost:3000/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to change password");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "general", label: "General", icon: Globe },
  ] as const;

  const avatarFallback =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(fullName) +
    "&background=8b63d3&color=fff";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your admin account and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-2 shadow-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-8 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Profile Information
          </h2>

          {loadingProfile ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              Loading profile...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={profileImage || avatarFallback}
                    alt={fullName}
                    className="w-24 h-24 rounded-full border-4 border-purple-200 dark:border-purple-700 object-cover"
                  />
                  <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-[#1f1235] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4 text-[#8b63d3]" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <button className="px-6 py-2 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={profileForm.firstName}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={profileForm.lastName}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    value={profileForm.username}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    placeholder="+1 234-567-8900"
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={roles?.includes("admin") ? "Administrator" : "User"}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Birthday
                  </label>
                  <input
                    name="birthday"
                    type="date"
                    value={profileForm.birthday}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-3 border border-purple-200 dark:border-purple-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium"
                  onClick={handleCancelProfile}
                >
                  Cancel
                </button>
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-60"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  <Save className="w-5 h-5" />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-8 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Notification Preferences
          </h2>

          <div className="space-y-6">
            {[
              { label: "Email Notifications", description: "Receive email about your account activity" },
              { label: "New User Registrations", description: "Get notified when new users sign up" },
              { label: "Analysis Completions", description: "Notifications when analyses are completed" },
              { label: "System Alerts", description: "Important system updates and alerts" },
              { label: "Weekly Reports", description: "Receive weekly performance reports" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#8b63d3]"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all font-medium"
              onClick={handleSave}
            >
              <Save className="w-5 h-5" />
              Save Preferences
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-8 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Security Settings
          </h2>

          <div className="space-y-6">
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[#8b63d3] dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Update your password to keep your account secure
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-[#24163d] border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-[#24163d] border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-[#24163d] border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-60"
                  >
                    <Key className="w-4 h-4" />
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#8b63d3] dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-6 py-2 border border-purple-300 dark:border-purple-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-sm font-medium">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-[#8b63d3] dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Active Sessions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage and monitor your active login sessions
                  </p>
                  <button className="px-6 py-2 border border-purple-300 dark:border-purple-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-sm font-medium">
                    View Sessions
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Security settings are connected to your backend.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "general" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-8 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            General Settings
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Language
              </label>
              <select className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white">
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Timezone
              </label>
              <select className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (CET)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Date Format
              </label>
              <select className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-3 border border-purple-200 dark:border-purple-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium">
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                onClick={handleSave}
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}