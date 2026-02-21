"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Week, TimesheetEntry, DailyEntries } from "@/lib/types";
import EntryModal from "@/components/EntryModal";
import { useToast, ToastContainer } from "@/components/Toast";

export default function WeekDetailsPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = use(params);
  const [week, setWeek] = useState<Week | null>(null);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntries>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    entryId: number | null;
  }>({ isOpen: false, entryId: null });
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const id = parseInt(weekId);

  useEffect(() => {
    fetchWeekData();
  }, [id]);

  const fetchWeekData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/weeks/${id}`);
      if (!response.ok) throw new Error("Failed to fetch week data");

      const data = await response.json();
      setWeek(data.week);
      setEntries(data.entries || []);
      groupEntriesByDate(data.entries || []);
    } catch (error) {
      addToast("Failed to load week data", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupEntriesByDate = (entries: TimesheetEntry[]) => {
    const grouped: DailyEntries = {};
    entries.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = [];
      }
      grouped[entry.date].push(entry);
    });
    setDailyEntries(grouped);
  };

  const handleAddEntry = (date: string) => {
    setSelectedDate(date);
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleEditEntry = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setSelectedDate(entry.date);
    setModalOpen(true);
  };

  const handleDeleteEntry = async (entryId: number) => {
    setDeleteConfirmModal({ isOpen: true, entryId });
  };

  const handleConfirmDelete = async () => {
    const entryId = deleteConfirmModal.entryId;
    if (!entryId) return;

    try {
      const response = await fetch(`/api/timesheet/${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete entry");

      const updatedEntries = entries.filter((e) => e.id !== entryId);
      setEntries(updatedEntries);
      groupEntriesByDate(updatedEntries);
      addToast("Entry deleted successfully", "success");
      setDeleteConfirmModal({ isOpen: false, entryId: null });
      fetchWeekData(); // Refresh week data
    } catch (error) {
      addToast("Failed to delete entry", "error");
      console.error(error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, entryId: null });
  };

  const handleSubmitEntry = async (data: any) => {
    try {
      const payload = {
        ...data,
        date: selectedDate || data.date,
        week_id: id,
      };

      if (editingEntry) {
        // Update existing entry
        const response = await fetch(`/api/timesheet/${editingEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update entry");
        }

        addToast("Entry updated successfully", "success");
      } else {
        // Create new entry
        const response = await fetch("/api/timesheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add entry");
        }

        addToast("Entry added successfully", "success");
      }

      setModalOpen(false);
      setEditingEntry(null);
      await fetchWeekData();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to save entry",
        "error",
      );
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  if (!week) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ color: "#6b7280" }}>Week not found</p>
      </div>
    );
  }

  const startDate = new Date(week.start_date);
  const endDate = new Date(week.end_date);

  const dateRange = `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleString(
    "default",
    {
      month: "short",
    },
  )} ${endDate.getFullYear()}`;

  const maxHours = Math.max(0, 40 - week.total_hours);

  // Generate all dates in the week
  const allDates: string[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#fff" }}
      >
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "90vw",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            paddingTop: "1.5rem",
            paddingBottom: "1.5rem",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              marginBottom: "1rem",
              color: "#3b82f6",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
          >
            ← Back
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#ffffff",
              //borderBottom: "1px solid #e5e7eb",
              //borderRadius: "12px",
              //padding: "24px",
              // boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {/* Left */}
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}
            >
              This Week Timesheet
            </h1>

            {/* Right Progress */}
            <div style={{ width: "320px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4b5563",
                  }}
                >
                  Progress: {week.total_hours} / 40 hours
                </span>

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#2563eb",
                  }}
                >
                  {Math.round((week.total_hours / 40) * 100)}%
                </span>
              </div>

              <div
                style={{
                  height: "8px",
                  width: "100%",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((week.total_hours / 40) * 100, 100)}%`,
                    height: "8px",
                    backgroundColor: "#ff8a4c",
                    borderRadius: "9999px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </div>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "1.125rem",
              color: "#4b5563",
            }}
          >
            {dateRange}
          </p>
        </div>
      </div>

      {/* Daily Entries */}
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "90vw",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
          backgroundColor: "#ffffff",
        }}
      >
        {allDates.map((date) => {
          const dateObj = new Date(date);
          const dateLabel = dateObj.toLocaleString("default", {
            weekday: "long",
            day: "numeric",
            month: "short",
          });

          return (
            <div key={date} style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  marginBottom: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {dateLabel}
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {dailyEntries[date]?.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#ffffff",
                      padding: "0.5rem",
                      transition: "box-shadow 0.2s ease",
                      position: "relative",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(0,0,0,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* LEFT → Project Type */}
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#111827",
                          fontSize: "14px",
                        }}
                      >
                        {entry.type_of_work}
                      </div>

                      {/* RIGHT */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          position: "relative",
                        }}
                      >
                        {/* Hours */}
                        <span
                          style={{
                            color: "#a1a8b4",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          {entry.hours}h
                        </span>

                        {/* Project Name */}
                        <span
                          style={{
                            color: "#3a63eb",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {entry.project_name}
                        </span>

                        {/* Three Dot Menu */}
                        <div
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              const menu = e.currentTarget.nextSibling;
                              menu.style.display =
                                menu.style.display === "block"
                                  ? "none"
                                  : "block";
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              borderRadius: "6px",
                              lineHeight: 1,
                            }}
                          >
                            ...
                          </button>

                          {/* Dropdown */}
                          <div
                            style={{
                              display: "none",
                              position: "absolute",
                              right: 0,
                              top: "28px",
                              background: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                              zIndex: 10,
                              minWidth: "100px",
                            }}
                          >
                            <button
                              onClick={() => handleEditEntry(entry)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                background: "transparent",
                                border: "none",
                                textAlign: "left",
                                cursor: "pointer",
                                fontSize: "13px",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                background: "transparent",
                                border: "none",
                                textAlign: "left",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#dc2626",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleAddEntry(date)}
                  style={{
                    width: "100%",
                    borderRadius: "0.5rem",
                    border: "2px dashed #d1d5db",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    textAlign: "center",
                    fontWeight: "500",
                    color: "#4b5563",
                    backgroundColor: "transparent",
                    transition: "all",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.color = "#2563eb";
                    e.currentTarget.style.backgroundColor = "#e1effe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.color = "#4b5563";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  + Add New Task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <EntryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleSubmitEntry}
        isEdit={!!editingEntry}
        initialData={
          editingEntry
            ? { ...editingEntry, date: selectedDate }
            : { date: selectedDate, week_id: id }
        }
        maxHours={editingEntry ? 40 : maxHours}
        dailyHours={
          dailyEntries[selectedDate]?.reduce(
            (sum: number, entry: TimesheetEntry) =>
              sum + (entry.id === editingEntry?.id ? 0 : entry.hours),
            0,
          ) || 0
        }
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              maxWidth: "28rem",
              width: "90%",
              padding: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Delete Entry
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCancelDelete}
                style={{
                  borderRadius: "0.375rem",
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  border: "none",
                  transition: "all",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d1d5db")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e5e7eb")
                }
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  borderRadius: "0.375rem",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  border: "none",
                  transition: "all",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dc2626")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ef4444")
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
