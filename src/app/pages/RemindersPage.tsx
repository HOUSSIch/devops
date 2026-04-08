import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Clock,
  Sun,
  Moon,
  Sparkles,
  Plus,
  Trash2,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import keycloak from "../contexts/keycloak";

interface Reminder {
  id: string;
  type: "morning" | "evening" | "special";
  time: string;
  title: string;
  description: string;
  enabled: boolean;
  days: string[];
}

interface ActivePopupReminder extends Reminder {
  triggeredAt: number;
}

export default function RemindersPage() {
  const { isInitialized, isAuthenticated, login, refreshNow } = useAuth();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeReminderPopup, setActiveReminderPopup] = useState<ActivePopupReminder | null>(null);

  const triggeredReminderRef = useRef<Record<string, boolean>>({});

  const [formReminder, setFormReminder] = useState<Partial<Reminder>>({
    type: "morning",
    time: "08:00",
    title: "",
    description: "",
    enabled: true,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayMap = useMemo(
    () => ({
      0: "Sun",
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
    }),
    [],
  );

  const clearMessagesLater = () => {
    window.setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 2500);
  };

  const resetForm = () => {
    setFormReminder({
      type: "morning",
      time: "08:00",
      title: "",
      description: "",
      enabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    });
    setEditingReminderId(null);
    setShowForm(false);
  };

  const fetchReminders = async () => {
    try {
      await refreshNow();
      const token = keycloak.token;

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch("http://localhost:3000/reminders/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to load reminders",
        );
      }

      const normalized: Reminder[] = Array.isArray(data)
        ? data.map((r: any) => ({
            id: r.id,
            type: r.type,
            time: r.time,
            title: r.title,
            description: r.description || "",
            enabled: !!r.enabled,
            days: Array.isArray(r.days) ? r.days : [],
          }))
        : [];

      setReminders(normalized);
      setErrorMessage("");
    } catch (error: any) {
      console.error("Failed to fetch reminders:", error);
      setErrorMessage(error?.message || "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchReminders();
  }, [isInitialized, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentDay = dayMap[now.getDay() as keyof typeof dayMap];
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${currentHours}:${currentMinutes}`;
      const currentDateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      const matchingReminder = reminders.find((reminder) => {
        if (!reminder.enabled) return false;
        if (!reminder.days.includes(currentDay)) return false;
        if (reminder.time !== currentTime) return false;

        const uniqueTriggerKey = `${reminder.id}_${currentDateKey}_${currentTime}`;
        if (triggeredReminderRef.current[uniqueTriggerKey]) return false;

        triggeredReminderRef.current[uniqueTriggerKey] = true;
        return true;
      });

      if (matchingReminder) {
        setActiveReminderPopup({
          ...matchingReminder,
          triggeredAt: Date.now(),
        });
      }
    };

    checkReminders();
    const interval = window.setInterval(checkReminders, 5000);

    return () => window.clearInterval(interval);
  }, [reminders, isAuthenticated, dayMap]);

  const toggleReminder = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await refreshNow();
      const token = keycloak.token;

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`http://localhost:3000/reminders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: !target.enabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to update reminder",
        );
      }

      setReminders((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                enabled: data.enabled ?? !target.enabled,
              }
            : r,
        ),
      );

      setSuccessMessage(`Reminder ${!target.enabled ? "enabled" : "disabled"} successfully`);
      clearMessagesLater();
    } catch (error: any) {
      console.error("toggleReminder error:", error);
      setErrorMessage(error?.message || "Failed to update reminder");
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  const openEditReminder = (reminder: Reminder) => {
    setEditingReminderId(reminder.id);
    setFormReminder({
      type: reminder.type,
      time: reminder.time,
      title: reminder.title,
      description: reminder.description,
      enabled: reminder.enabled,
      days: reminder.days,
    });
    setShowForm(true);
  };

  const saveReminder = async () => {
    if (!formReminder.title || !formReminder.time) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await refreshNow();
      const token = keycloak.token;

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const payload = {
        type: formReminder.type || "morning",
        time: formReminder.time || "08:00",
        title: formReminder.title,
        description: formReminder.description || "",
        enabled: formReminder.enabled ?? true,
        days: formReminder.days || [],
      };

      const isEdit = !!editingReminderId;
      const url = isEdit
        ? `http://localhost:3000/reminders/${editingReminderId}`
        : "http://localhost:3000/reminders";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || `Failed to ${isEdit ? "update" : "create"} reminder`,
        );
      }

      const normalizedReminder: Reminder = {
        id: data.id,
        type: data.type,
        time: data.time,
        title: data.title,
        description: data.description || "",
        enabled: !!data.enabled,
        days: Array.isArray(data.days) ? data.days : [],
      };

      if (isEdit) {
        setReminders((prev) =>
          prev.map((r) => (r.id === editingReminderId ? normalizedReminder : r)),
        );
        setSuccessMessage("Reminder updated successfully");
      } else {
        setReminders((prev) => [normalizedReminder, ...prev]);
        setSuccessMessage("Reminder created successfully");
      }

      resetForm();
      clearMessagesLater();
    } catch (error: any) {
      console.error("saveReminder error:", error);
      setErrorMessage(error?.message || "Failed to save reminder");
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await refreshNow();
      const token = keycloak.token;

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`http://localhost:3000/reminders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to delete reminder",
        );
      }

      setReminders((prev) => prev.filter((r) => r.id !== id));
      setSuccessMessage("Reminder deleted successfully");
      clearMessagesLater();
    } catch (error: any) {
      console.error("deleteReminder error:", error);
      setErrorMessage(error?.message || "Failed to delete reminder");
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    const days = formReminder.days || [];
    setFormReminder({
      ...formReminder,
      days: days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    });
  };

  const handleReminderDone = () => {
    setSuccessMessage("Great job! Reminder marked as done.");
    setActiveReminderPopup(null);
    clearMessagesLater();
  };

  const handleReminderNotDone = () => {
    setErrorMessage("Reminder marked as not done.");
    setActiveReminderPopup(null);
    clearMessagesLater();
  };

  const closeReminderPopup = () => {
    setActiveReminderPopup(null);
  };


  const triggerTestPopup = () => {
    if (reminders.length > 0) {
      setActiveReminderPopup({
        ...reminders[0],
        triggeredAt: Date.now(),
      });
    } else {
      setActiveReminderPopup({
        id: "test",
        type: "special",
        time: "Now",
        title: "Test Reminder",
        description: "This is how your reminder popup will appear.",
        enabled: true,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        triggeredAt: Date.now(),
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "morning":
        return <Sun className="w-5 h-5" />;
      case "evening":
        return <Moon className="w-5 h-5" />;
      case "special":
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "morning":
        return "from-amber-400 to-orange-500";
      case "evening":
        return "from-indigo-500 to-purple-600";
      case "special":
        return "from-pink-400 to-rose-500";
      default:
        return "from-purple-400 to-purple-600";
    }
  };

  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fbf3fe] to-[#ece2f9]">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Please log in</h2>
          <button
            onClick={() => login("/reminders")}
            className="bg-[#8b63d3] text-white px-6 py-3 rounded-xl"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] to-[#ece2f9] pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#6b46b8] mb-4 shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Routine Reminders</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Never miss a step in your skincare journey.
            </p>
          </div>

          {(successMessage || errorMessage) && (
            <div
              className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
                successMessage
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {successMessage || errorMessage}
            </div>
          )}

          <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-[#8b63d3] mb-1">
                  {reminders.filter((r) => r.enabled).length}
                </div>
                <div className="text-sm text-gray-600">Active Reminders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#8b63d3] mb-1">
                  {
                    reminders.filter(
                      (r) => (r.type === "morning" || r.type === "evening") && r.enabled,
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Daily Routines</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#8b63d3] mb-1">
                  {reminders.filter((r) => r.type === "special" && r.enabled).length}
                </div>
                <div className="text-sm text-gray-600">Special Care</div>
              </div>
            </div>
          </div>

         

          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              Loading reminders...
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`backdrop-blur-lg bg-white/70 rounded-2xl shadow-lg border border-white/50 overflow-hidden transition-all duration-300 ${
                      reminder.enabled ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(
                            reminder.type,
                          )} flex items-center justify-center text-white shadow-lg`}
                        >
                          {getTypeIcon(reminder.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {reminder.title}
                              </h3>
                              <p className="text-sm text-gray-600">{reminder.description}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => openEditReminder(reminder)}
                                disabled={saving}
                                className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                type="button"
                                aria-label="Edit reminder"
                              >
                                <Pencil className="w-4 h-4 text-[#8b63d3]" />
                              </button>

                              <button
                                onClick={() => toggleReminder(reminder.id)}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  reminder.enabled ? "bg-[#8b63d3]" : "bg-gray-300"
                                }`}
                                aria-label={
                                  reminder.enabled ? "Disable reminder" : "Enable reminder"
                                }
                                type="button"
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    reminder.enabled ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>

                              <button
                                onClick={() => deleteReminder(reminder.id)}
                                disabled={saving}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Delete reminder"
                                type="button"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{reminder.time}</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {weekDays.map((day) => (
                                <span
                                  key={day}
                                  className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                    reminder.days.includes(day)
                                      ? "bg-[#8b63d3] text-white"
                                      : "bg-gray-200 text-gray-400"
                                  }`}
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!showForm && (
                <button
                  onClick={() => {
                    setEditingReminderId(null);
                    setFormReminder({
                      type: "morning",
                      time: "08:00",
                      title: "",
                      description: "",
                      enabled: true,
                      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    });
                    setShowForm(true);
                  }}
                  className="w-full backdrop-blur-lg bg-white/70 rounded-2xl shadow-lg border-2 border-dashed border-[#8b63d3]/30 p-8 hover:border-[#8b63d3]/60 hover:bg-white/80 transition-all duration-300 group"
                  type="button"
                >
                  <div className="flex items-center justify-center gap-3 text-[#8b63d3]">
                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-semibold">Add New Reminder</span>
                  </div>
                </button>
              )}

              {showForm && (
                <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {editingReminderId ? "Update Reminder" : "Create New Reminder"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reminder Type
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["morning", "evening", "special"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFormReminder({ ...formReminder, type })}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              formReminder.type === type
                                ? "border-[#8b63d3] bg-[#8b63d3]/10"
                                : "border-gray-200 hover:border-[#8b63d3]/50"
                            }`}
                            type="button"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(
                                  type,
                                )} flex items-center justify-center text-white`}
                              >
                                {getTypeIcon(type)}
                              </div>
                              <span className="text-sm font-medium capitalize">{type}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formReminder.title}
                        onChange={(e) =>
                          setFormReminder({ ...formReminder, title: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8b63d3] focus:ring-2 focus:ring-[#8b63d3]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formReminder.description}
                        onChange={(e) =>
                          setFormReminder({ ...formReminder, description: e.target.value })
                        }
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8b63d3] focus:ring-2 focus:ring-[#8b63d3]/20 outline-none transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formReminder.time}
                        onChange={(e) =>
                          setFormReminder({ ...formReminder, time: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8b63d3] focus:ring-2 focus:ring-[#8b63d3]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat on
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {weekDays.map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              formReminder.days?.includes(day)
                                ? "bg-[#8b63d3] text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            type="button"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveReminder}
                        disabled={!formReminder.title || !formReminder.time || saving}
                        className="flex-1 bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        type="button"
                      >
                        <Check className="w-5 h-5" />
                        {editingReminderId ? "Update Reminder" : "Add Reminder"}
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 backdrop-blur-lg bg-gradient-to-br from-[#8b63d3]/10 to-[#6b46b8]/10 rounded-2xl p-6 border border-[#8b63d3]/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#8b63d3]/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#8b63d3]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Stay Consistent with Your Routine
                    </h4>
                    <p className="text-sm text-gray-600">
                      Your reminders are saved per account. Use the test button to preview the popup instantly.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeReminderPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/90 shadow-2xl overflow-hidden">
            <div className={`h-2 w-full bg-gradient-to-r ${getTypeColor(activeReminderPopup.type)}`} />

            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getTypeColor(
                      activeReminderPopup.type,
                    )} flex items-center justify-center text-white shadow-lg`}
                  >
                    {getTypeIcon(activeReminderPopup.type)}
                  </div>
                  <div>
                    <p className="text-sm text-[#8b63d3] font-semibold">Reminder</p>
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeReminderPopup.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={closeReminderPopup}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-5 rounded-2xl bg-[#f7f0ff] p-4 border border-[#e4d3ff]">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold text-gray-900">Time:</span>{" "}
                  {activeReminderPopup.time}
                </p>
                <p className="text-gray-800">
                  {activeReminderPopup.description || "It's time for your skincare reminder."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReminderNotDone}
                  className="rounded-2xl border border-gray-300 bg-white py-3 px-4 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  type="button"
                >
                  Je n’ai pas fait
                </button>
                <button
                  onClick={handleReminderDone}
                  className="rounded-2xl bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] py-3 px-4 font-semibold text-white shadow-lg hover:scale-[1.02] transition-all"
                  type="button"
                >
                  J’ai fait
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}