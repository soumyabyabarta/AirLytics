// src/components/ThemeToggle.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 bg-gray-300 dark:bg-gray-700 rounded-full p-1 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <motion.div
        className="w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center text-xs"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{
          marginLeft: theme === "dark" ? "auto" : "0",
          marginRight: theme === "light" ? "auto" : "0", // Fix for layout alignment
        }}
      >
        {theme === "dark" ? (
          <FaMoon className="text-yellow-400" />
        ) : (
          <FaSun className="text-orange-500" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;