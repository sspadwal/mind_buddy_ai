import React, { useEffect, useRef, useState } from "react";
import Customeinput from "../components/Customeinput";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AuthModal from "../components/AuthModal";
import {
  ArrowUp,
  History as HistoryIcon,
  ChevronRight,
  List,
} from "lucide-react";

const EmployeeDashboard = ({ children }) => {
  const Backend_uri = import.meta.env.VITE_BACKEND_URI;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm();

  const queryValue = watch("query");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const timerRef = useRef(null);

  const onSubmit = async (data) => {
    if (!user) {
      sessionStorage.setItem("pendingQuery", data.query);
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${Backend_uri}mood/add`,
        {
          entry_text: data.query,
          department: user.department,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage(res.data.feedback);
      setHistory((prev) => [res.data.data, ...prev]);
      reset({ query: "" });

      timerRef.current = setTimeout(() => {
        setMessage("");
      }, 30000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(errorMsg);

      timerRef.current = setTimeout(() => {
        setError("");
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  const historyHandler = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${Backend_uri}mood/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.message);
    } catch (err) {
      // Error handled by UI
    }
  };

  useEffect(() => {
    if (user) historyHandler();
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [user]);

  return (
    <div className="flex h-full w-full bg-[#212121] overflow-hidden relative">
      <AuthModal
        showAuthModal={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {user?.role === "employee" && (
        <button
          onClick={() => setShowHistoryList(!showHistoryList)}
          className="absolute top-4 left-4 md:top-6 md:left-6 p-2 text-gray-400 hover:text-white hover:bg-[#2F2F2F] rounded-lg z-20"
        >
          {showHistoryList ? (
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
          ) : (
            <List className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      )}

      {/* MAIN FLEX CONTAINER */}
      <div className="flex-1 flex flex-col h-full items-center w-full px-4">
        {showHistoryList ? (
          /* 🔥 FIXED HISTORY CONTAINER */
          <div className="flex flex-col w-full max-w-4xl h-full pt-16 md:pt-20 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-[#ECECEC] mb-4 md:mb-6 flex items-center gap-2 flex-shrink-0">
              <HistoryIcon className="w-5 h-5 md:w-6 md:h-6" /> Your History
            </h1>

            {/* 🔥 THIS AREA IS NOW INDEPENDENTLY SCROLLABLE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No history found.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#2F2F2F] p-4 md:p-5 rounded-xl border border-[#3E3E3E] h-fit"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] md:text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-[#ECECEC] text-sm leading-relaxed">
                        "{item.entry_text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* DESKTOP-OPTIMIZED VIEW (Mobile Restricted via MainLayout) */
          <div className="flex-1 flex flex-col items-center justify-start pt-24 md:pt-32 w-full max-w-5xl px-4 pb-20">
            <div className="flex flex-col items-center justify-start w-full px-2 mb-12">
              {!message && !loading && (
                <h1 className="text-2xl md:text-3xl font-bold text-[#ECECEC] text-center max-w-none leading-snug">
                  Hey {user?.username}! How are you really feeling about work
                  today?
                </h1>
              )}

              {loading && (
                <h1 className="text-lg md:text-xl text-[#ECECEC] animate-pulse">
                  Processing...
                </h1>
              )}

              {message && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 mt-8">
                  <div className="p-6 bg-[#2F2F2F] rounded-2xl text-[#ECECEC] border border-[#3E3E3E] text-base shadow-xl">
                    {message}
                  </div>
                </div>
              )}

              {error && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 mt-8">
                  <div className="p-4 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 text-sm text-center">
                    {error}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-2xl px-2">
              <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="relative flex items-center bg-[#2F2F2F] rounded-[26px] border border-[#3E3E3E] overflow-hidden focus-within:border-gray-500 transition-colors shadow-2xl">
                  <Customeinput
                    {...register("query", { required: true })}
                    placeholder="Describe your day..."
                    className="w-full bg-transparent text-[#ECECEC] px-6 py-4 pr-14 outline-none border-none focus:ring-0 text-base"
                  />

                  <button
                    type="submit"
                    disabled={!queryValue?.trim() || isSubmitting || loading}
                    className={`absolute right-3 p-2 rounded-xl transition-all duration-200 ${
                      !queryValue?.trim() || isSubmitting || loading
                        ? "bg-[#3E3E3E] text-gray-500 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  MindBuddy provides professional emotional support based on
                  your entries.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
