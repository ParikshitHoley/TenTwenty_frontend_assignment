"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Week } from "@/lib/types";
import { useToast, ToastContainer } from "@/components/Toast";

const columnHelper = createColumnHelper<Week>();

export default function DashboardPage() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchWeeks();
  }, []);

  const fetchWeeks = async (filters?: any) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      const startDate = filters?.start ?? dateRange.start;
      const endDate = filters?.end ?? dateRange.end;
      const status = filters?.status ?? statusFilter;

      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      if (status) {
        params.append("status", status);
      }

      const url = `/api/weeks${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch weeks");

      const data = await response.json();
      setWeeks(data);
    } catch (error) {
      addToast("Failed to load weeks", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    fetchWeeks({
      start: dateRange.start,
      end: dateRange.end,
      status: statusFilter,
    });
  };

  const handleClearFilters = async () => {
    setDateRange({ start: "", end: "" });
    setStatusFilter("");
    // Fetch without any filters
    try {
      setIsLoading(true);
      const response = await fetch(`/api/weeks`);
      if (!response.ok) throw new Error("Failed to fetch weeks");
      const data = await response.json();
      setWeeks(data);
    } catch (error) {
      addToast("Failed to load weeks", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    columnHelper.accessor("week_number", {
      header: "Week",
      cell: (info) => `Week ${info.getValue()}`,
      size: 100,
    }),
    columnHelper.accessor((row) => `${row.start_date} - ${row.end_date}`, {
      id: "dateRange",
      header: "Date Range",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors: Record<string, { bg: string; text: string }> = {
          Completed: { bg: "#dcfce7", text: "#166534" },
          Incomplete: { bg: "#fef3c7", text: "#92400e" },
          Missing: { bg: "#fee2e2", text: "#991b1b" },
        };
        const color = colors[status] || { bg: "", text: "" };
        return (
          <span
            style={{
              backgroundColor: color.bg,
              color: color.text,
              borderRadius: "8px",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            {status}
          </span>
        );
      },
      size: 120,
    }),
    columnHelper.accessor("total_hours", {
      header: "Total Hours",
      cell: (info) => `${info.getValue()} hrs`,
      size: 120,
    }),
    columnHelper.display({
      id: "action",
      header: "Action",
      cell: (info) => {
        const week = info.row.original;
        const action =
          week.status === "Completed"
            ? "View"
            : week.status === "Incomplete"
              ? "Update"
              : "Create";

        return (
          <button
            onClick={() => router.push(`/dashboard/${week.id}`)}
            style={{
              border: "none",
              backgroundColor: "#ffffff",
              color: "#3b82f6",
              cursor: "pointer",
              fontWeight: "500",
              padding: 0,
            }}
          >
            {action}
          </button>
        );
      },
      size: 100,
    }),
  ];

  const table = useReactTable({
    data: weeks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#fff" }}
      >
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "80rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            paddingTop: "1.5rem",
            paddingBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Your Timesheet
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#ef4444",
                color: "#fff",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: "all",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#dc2626")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ef4444")
              }
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "80rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {/* Filters */}
        <div
          style={{
            marginBottom: "1.5rem",
            borderRadius: "0.5rem",
            backgroundColor: "#fff",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            paddingTop: "1.5rem",
            paddingBottom: "1.5rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              marginBottom: "1rem",
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Filters
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                style={{
                  marginTop: "0.25rem",
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
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                style={{
                  marginTop: "0.25rem",
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
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  marginTop: "0.25rem",
                  width: "100%",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Missing">Missing</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handleFilter}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#3b82f6",
                color: "#fff",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: "all",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#3b82f6")
              }
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
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
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            borderRadius: "0.5rem",
            backgroundColor: "#fff",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <div
              style={{
                paddingLeft: "2rem",
                paddingRight: "2rem",
                paddingTop: "2rem",
                paddingBottom: "2rem",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Loading...
            </div>
          ) : weeks.length === 0 ? (
            <div
              style={{
                paddingLeft: "2rem",
                paddingRight: "2rem",
                paddingTop: "2rem",
                paddingBottom: "2rem",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              No weeks found
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%" }}>
                  <thead
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            style={{
                              cursor: "pointer",
                              paddingLeft: "1.5rem",
                              paddingRight: "1.5rem",
                              paddingTop: "0.75rem",
                              paddingBottom: "0.75rem",
                              textAlign: "left",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#111827",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <span>
                                {{
                                  asc: " 🔼",
                                  desc: " 🔽",
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              paddingLeft: "1.5rem",
                              paddingRight: "1.5rem",
                              paddingTop: "1rem",
                              paddingBottom: "1rem",
                              fontSize: "0.875rem",
                              color: "#374151",
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    style={{
                      borderRadius: "0.375rem",
                      backgroundColor: "#e5e7eb",
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      paddingTop: "0.25rem",
                      paddingBottom: "0.25rem",
                      opacity: !table.getCanPreviousPage() ? 0.5 : 1,
                      cursor: !table.getCanPreviousPage()
                        ? "not-allowed"
                        : "pointer",
                      border: "none",
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    style={{
                      borderRadius: "0.375rem",
                      backgroundColor: "#e5e7eb",
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      paddingTop: "0.25rem",
                      paddingBottom: "0.25rem",
                      opacity: !table.getCanNextPage() ? 0.5 : 1,
                      cursor: !table.getCanNextPage()
                        ? "not-allowed"
                        : "pointer",
                      border: "none",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
