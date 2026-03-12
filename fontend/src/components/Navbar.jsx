import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, Logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const logoutHandler = () => {
    Logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 flex justify-between items-center px-4 md:px-6 py-4 w-full bg-[#1a1a1a] md:bg-transparent z-40">
      <div className="flex items-center gap-2">
        <NavLink
          to="/"
          className="flex items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <img
            src="/logo.png"
            alt="MindBuddy Logo"
            className="h-8 md:h-12 w-auto object-contain rounded-lg"
          />
          <span className="text-lg md:text-xl font-bold tracking-tight text-white">
            MindBuddy
          </span>
        </NavLink>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        {user?.role === "admin" ? (
          <NavLink
            to="/manager/dashboard"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </NavLink>
        ) : null}
        {user ? (
          <button
            onClick={logoutHandler}
            className="px-4 py-2 rounded-lg bg-[#2F2F2F] hover:bg-[#424242] transition-colors text-sm font-medium"
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink
              to="/login"
              className="px-4 py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors text-sm font-medium"
            >
              Log in
            </NavLink>
            <NavLink
              to="/register"
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Sign up
            </NavLink>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-white p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1a1a1a] border-b border-[#2F2F2F] flex flex-col p-4 space-y-4 md:hidden animate-in slide-in-from-top duration-200">
          {user?.role === "admin" && (
            <NavLink
              to="/manager/dashboard"
              className="text-gray-300 hover:text-white text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </NavLink>
          )}
          {user ? (
            <button
              onClick={logoutHandler}
              className="w-full text-left py-2 text-gray-300 hover:text-white text-lg font-medium"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-gray-300 hover:text-white text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="w-full py-3 bg-white text-black text-center font-bold rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
