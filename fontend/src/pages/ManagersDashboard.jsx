import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import axios from "axios";
import {
  MessageSquare,
  FileText,
  Users,
  LayoutDashboard,
  Brain,
  History,
  TrendingUp,
  Clock,
  Sparkles,
  Menu,
  X,
  MonitorOff,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Layers,
} from "lucide-react";

const ManagersDashboard = () => {
  const { user } = useAuth();
  const Backend_uri = import.meta.env.VITE_BACKEND_URI;
  const [analytics, setAnalytics] = useState();
  const [rawdata, setRawData] = useState();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("moods");
  const [summary, setSummary] = useState("");
  const [history, sethistory] = useState([]);
  const currentCount = analytics?.unsummarizedCount || 0;
  const progress = Math.min((currentCount / 15) * 100, 100);

  const userHandling = async () => {
    if (user == null) {
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    const security_Header = "Bearer " + token;
    try {
      const managerData = await axios.get(
        `${Backend_uri}mood/analytics/${user.department}`,
        { headers: { Authorization: security_Header } },
      );
      setAnalytics(managerData.data.stats);
      setRawData(managerData.data.data);
    } catch (err) {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    userHandling();
  }, [user?.department]);

  const categorySummary = useMemo(() => {
    const category_count = {};
    if (!rawdata) {
      return [];
    } else {
      rawdata.map((item) => {
        item.category_tags.map((category) => {
          if (!category_count[category]) {
            category_count[category] = 1;
          } else {
            category_count[category] = category_count[category] + 1;
          }
        });
      });
    }
    const category_array = Object.entries(category_count);
    const new_arr = category_array.map((item) => {
      return {
        name: item[0],
        count: item[1],
      };
    });
    const final_array = new_arr.sort((a, b) => b.count - a.count).slice(0, 8);
    return final_array;
  }, [rawdata]);

  const sentimentDetails = useMemo(() => {
    if (!analytics) {
      return {
        percent: 0,
        emoji: "⏳",
        color: "text-gray-400",
        label: "Loading...",
      };
    } else {
      const percent = Math.round((analytics?.averageSentiment + 1) * 50);
      const score = analytics.averageSentiment;
      if (score <= -0.6) {
        return { emoji: "😫", color: "text-red-500", label: "Crisis", percent };
      } else if (score < 0) {
        return {
          emoji: "😟",
          color: "text-orange-500",
          label: "Stressed",
          percent,
        };
      } else if (score < 0.5) {
        return {
          emoji: "😐",
          color: "text-yellow-400",
          label: "Stable",
          percent,
        };
      } else {
        return {
          emoji: "😊",
          color: "text-green-500",
          label: "Healthy",
          percent,
        };
      }
    }
  }, [analytics]);

  const COLORS = [
    "#e63946",
    "#f77f00",
    "#fcbf49",
    "#90dbf4",
    "#4cc9f0",
    "#43aa8b",
    "#8ac926",
  ];

  const generateSummary = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const security_Header = "Bearer " + token;
    try {
      const final_summary = await axios.post(
        `${Backend_uri}mood/summarize`,
        {},
        { headers: { Authorization: security_Header } },
      );
      setSummary(final_summary.data.summaryText);
      // Refresh analytics and history after generation
      userHandling();
      fetchHistory();
    } catch (err) {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    const security_Header = "Bearer " + token;
    try {
      const Summary_history = await axios.get(
        `${Backend_uri}mood/summary-history/`,
        { headers: { Authorization: security_Header } },
      );
      sethistory(Summary_history.data.data);
    } catch (e) {
      // Error handled by UI
    }
  };
  useEffect(() => {
    fetchHistory();
  }, []);

  const menuItems = [
    { id: "moods", label: "User Query", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: LayoutDashboard },
    { id: "summary", label: "Summary", icon: FileText },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] w-full bg-[#212121] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 w-72 h-full bg-[#1a1a1a]/50 md:bg-transparent transition-transform duration-300 ease-in-out z-30 md:translate-x-0 flex-shrink-0 p-4 border-r border-[#2F2F2F]/30`}
      >
        <div className="mb-8 hidden md:block">
          <h2 className="text-white font-bold text-xl px-4">Manager Panel</h2>
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
                activeTab === item.id
                  ? "bg-[#2F2F2F] text-white shadow-md border border-[#3E3E3E]"
                  : "text-gray-400 hover:bg-[#252525] hover:text-gray-200"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#212121]">
        {loading && (
          <div className="absolute inset-0 bg-[#212121]/80 z-10 flex items-center justify-center">
            <span className="text-xl text-gray-300 animate-pulse">
              Loading data...
            </span>
          </div>
        )}

        {/* User Query View */}
        {activeTab === "moods" && (
          <div className="flex-1 p-4 md:p-8 space-y-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#ECECEC] mb-4 md:mb-6">
              User Queries
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {rawdata &&
                rawdata.map((item) => {
                  const dateObj = new Date(item.createdAt);
                  const level = item.urgency_level;
                  let urgencyColor =
                    "bg-green-500/20 text-green-400 border-green-500/30";
                  if (level >= 4)
                    urgencyColor =
                      "bg-red-500/20 text-red-400 border-red-500/30";
                  else if (level === 3)
                    urgencyColor =
                      "bg-orange-500/20 text-orange-400 border-orange-500/30";

                  return (
                    <div
                      key={item._id}
                      className="bg-[#2F2F2F] p-4 rounded-xl border border-[#3E3E3E] hover:border-gray-500 transition-colors shadow-sm"
                    >
                      <p className="text-[#ECECEC] mb-4 leading-relaxed break-words text-sm md:text-base">
                        "{item.entry_text}"
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.category_tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-[10px] md:text-xs bg-[#1a1a1a] text-gray-300 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] md:text-xs border-t border-[#3E3E3E] pt-3 mt-auto">
                        <span
                          className={`px-2 py-0.5 rounded-full border ${urgencyColor}`}
                        >
                          Level {level}
                        </span>
                        <span className="text-gray-500">
                          {dateObj.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeTab === "analytics" && analytics && (
          <div className="flex-1 p-4 md:p-8 space-y-8">
            <h1 className="text-xl md:text-2xl font-bold text-[#ECECEC] mb-4 md:mb-6">
              Department Analytics
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Mood Card */}
              <div className="bg-[#2F2F2F] p-4 md:p-6 rounded-2xl border border-[#3E3E3E] flex flex-col items-center justify-center gap-2 shadow-lg">
                <span className="text-3xl md:text-4xl mb-1 md:mb-2">
                  {sentimentDetails.emoji}
                </span>
                <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                  Avg Mood
                </h3>
                <span
                  className={`text-lg md:text-xl font-bold ${sentimentDetails.color}`}
                >
                  {sentimentDetails.label}
                </span>
              </div>

              {/* Alert Card */}
              <div className="bg-[#2F2F2F] p-4 md:p-6 rounded-2xl border border-[#3E3E3E] flex flex-col items-center justify-center gap-2 shadow-lg">
                <AlertTriangle
                  className={`w-8 h-8 md:w-10 md:h-10 ${analytics.criticalAlerts > 0 ? "text-red-500" : "text-gray-500"}`}
                />
                <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                  Critical Alerts
                </h3>
                <span
                  className={`text-lg md:text-xl font-bold ${analytics.criticalAlerts > 0 ? "text-red-500" : "text-gray-300"}`}
                >
                  {analytics.criticalAlerts} Active
                </span>
              </div>

              {/* Status Card */}
              <div className="bg-[#2F2F2F] p-4 md:p-6 rounded-2xl border border-[#3E3E3E] flex flex-col items-center justify-center gap-2 shadow-lg">
                <Activity className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                  System Status
                </h3>
                <span className="text-lg md:text-xl font-bold text-emerald-400">
                  {analytics.status || "Operational"}
                </span>
              </div>

              {/* Volume Card */}
              <div className="bg-[#2F2F2F] p-4 md:p-6 rounded-2xl border border-[#3E3E3E] flex flex-col items-center justify-center gap-2 shadow-lg">
                <Layers className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                  Total Entries
                </h3>
                <span className="text-lg md:text-xl font-bold text-white">
                  {analytics.totalEntries}
                </span>
              </div>
            </div>

            <div className="bg-[#2F2F2F] p-4 md:p-6 rounded-2xl border border-[#3E3E3E] shadow-lg">
              <h3 className="text-base md:text-lg font-semibold text-gray-300 mb-4 md:mb-6">
                Topic Frequency
              </h3>
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={categorySummary}
                    layout="vertical"
                    margin={{ top: 0, left: 0, right: 30, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#444"
                    />
                    <XAxis type="number" stroke="#888" fontSize={10} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      stroke="#ccc"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={15}>
                      {categorySummary.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Summary View */}
        {activeTab === "summary" && (
          <div className="flex-1 flex flex-col gap-6 p-4 md:p-8 min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-[#ECECEC]">
                Insights & Summary
              </h1>

              {/* Progress Bar & Guardrail Logic */}
              <div className="flex items-center gap-4 bg-[#2F2F2F] p-3 rounded-xl border border-[#3E3E3E] self-start sm:self-auto">
                <div className="text-xs md:text-sm text-gray-400">
                  Readiness:{" "}
                  <span className="text-white font-bold">
                    {currentCount}/15
                  </span>
                </div>
                <div className="w-24 md:w-32 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${progress >= 100 ? "bg-green-500" : "bg-white"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
              {/* Left Column: History List (Sidebar) */}
              <div className="w-full md:w-64 md:h-full bg-transparent border border-[#2F2F2F] rounded-2xl md:rounded-none md:border-none flex flex-col overflow-hidden max-h-[300px] md:max-h-none flex-shrink-0">
                <div className="p-4 border-b border-[#2F2F2F] font-semibold text-gray-300 text-sm">
                  History
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {history?.map((item) => {
                    const isSelected = item.summaryText === summary;
                    return (
                      <button
                        key={item._id}
                        onClick={() => setSummary(item.summaryText)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "bg-[#2F2F2F] text-white shadow-md"
                            : "text-gray-400 hover:bg-[#252525] hover:text-gray-200"
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                        <div className="text-[10px] opacity-50 uppercase mt-1">
                          {new Date(item.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {(!history || history.length === 0) && (
                    <div className="text-center py-6 text-gray-500 text-xs italic">
                      No history found.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: The Reader (Main Viewer) */}
              <div className="flex-1 bg-[#2F2F2F] rounded-2xl border border-[#3E3E3E] flex flex-col overflow-hidden shadow-lg min-h-[400px] md:min-h-0">
                <div className="p-4 border-b border-[#3E3E3E] flex flex-wrap items-center justify-between gap-4 bg-[#2a2a2a]">
                  <h3 className="text-base md:text-lg font-semibold text-gray-300 flex items-center gap-2">
                    Viewer
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={generateSummary}
                      disabled={loading || currentCount < 15}
                      className={`relative px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg active:scale-95 ${
                        loading || currentCount < 15
                          ? "bg-[#2F2F2F] text-gray-500 border border-[#3E3E3E] cursor-not-allowed"
                          : "bg-white text-[#212121]"
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-xs md:text-sm">
                        <Sparkles
                          className={`w-4 h-4 ${
                            loading || currentCount < 15
                              ? "text-gray-500"
                              : "text-[#212121]"
                          }`}
                        />
                        <span className="whitespace-nowrap">
                          {loading ? "Generating..." : "Generate Summary"}
                        </span>
                      </span>
                    </button>
                    {currentCount < 15 && (
                      <span className="text-[10px] text-orange-400 font-medium">
                        {currentCount}/15 Requires 15+ queries
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                  {summary ? (
                    <div className="text-[#ECECEC] text-sm md:text-base leading-relaxed whitespace-pre-wrap animate-in fade-in duration-300">
                      {summary}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs md:text-sm border-2 border-dashed border-[#444] rounded-xl p-8 md:p-12">
                      Select an report or generate fresh analysis.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagersDashboard;
