"use client";

import Modal from "./Modal";
import { useState } from "react";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isEdit?: boolean;
  initialData?: any;
  maxHours?: number;
  dailyHours?: number;
}

const WORK_TYPES = [
  "Development",
  "Testing",
  "Documentation",
  "Meeting",
  "Support",
  "Other",
];

const PROJECTS = ["Project A", "Project B", "Project C", "Internal"];

export default function EntryModal({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
  maxHours = 40,
  dailyHours = 0,
}: EntryModalProps) {
  const [hours, setHours] = useState(initialData?.hours || 1);
  const [isLoading, setIsLoading] = useState(false);

  // Max 12 hours per day, remaining hours available for the week
  const maxDailyHours = Math.min(12 - dailyHours, maxHours);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const data = {
        project_name: formData.get("project_name"),
        type_of_work: formData.get("type_of_work"),
        description: formData.get("description"),
        hours: parseInt(formData.get("hours") as string),
        date: formData.get("date"),
        week_id: parseInt(formData.get("week_id") as string),
      };
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHoursChange = (value: number) => {
    const newValue = Math.max(1, Math.min(maxDailyHours, value));
    setHours(newValue);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={isEdit ? "Edit Entry" : "Add Entry"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Save" : "Add Entry"}
      isLoading={isLoading}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Date
          </label>
          <input
            type="date"
            name="date"
            defaultValue={initialData?.date}
            required
            style={{
              marginTop: "0.25rem",
              display: "block",
              width: "100%",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Project <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="project_name"
            defaultValue={initialData?.project_name || ""}
            required
            style={{
              marginTop: "0.25rem",
              display: "block",
              width: "100%",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <option value="">Select a project</option>
            {PROJECTS.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Work Type <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="type_of_work"
            defaultValue={initialData?.type_of_work || ""}
            required
            style={{
              marginTop: "0.25rem",
              display: "block",
              width: "100%",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <option value="">Select work type</option>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Description
          </label>
          <textarea
            name="description"
            defaultValue={initialData?.description || ""}
            rows={3}
            style={{
              marginTop: "0.25rem",
              display: "block",
              width: "100%",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
            placeholder="Optional description"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Hours <span style={{ color: "#ef4444" }}>*</span>
            <span
              style={{
                color: "#6b7280",
                fontSize: "0.75rem",
                marginLeft: "0.25rem",
              }}
            >
              (Max: {maxDailyHours} hours per day)
            </span>
          </label>
          <div
            style={{
              marginTop: "0.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={() => handleHoursChange(hours - 1)}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#e5e7eb",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: "all",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d1d5db")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#e5e7eb")
              }
            >
              −
            </button>
            <input
              type="number"
              name="hours"
              value={hours}
              onChange={(e) => handleHoursChange(parseInt(e.target.value) || 1)}
              style={{
                width: "5rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                textAlign: "center",
              }}
              min="1"
              max={maxHours}
            />
            <button
              type="button"
              onClick={() => handleHoursChange(hours + 1)}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#e5e7eb",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: "all",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d1d5db")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#e5e7eb")
              }
            >
              +
            </button>
          </div>
        </div>

        <input
          type="hidden"
          name="week_id"
          value={initialData?.week_id || ""}
        />
      </div>
    </Modal>
  );
}
