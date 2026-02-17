import React from 'react';
import { motion } from 'framer-motion';
import { FaWind, FaExclamationTriangle, FaCheckCircle, FaSmog, FaSkull } from 'react-icons/fa';

const ResultCard = ({ data }) => {
  if (!data) return null;

  // Helper to get color and icon based on AQI
  const getStatusInfo = (aqi) => {
    if (aqi <= 50) return { color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-500", icon: <FaCheckCircle />, label: "Good" };
    if (aqi <= 100) return { color: "text-lime-500", bg: "bg-lime-100 dark:bg-lime-900/30", border: "border-lime-500", icon: <FaWind />, label: "Satisfactory" };
    if (aqi <= 200) return { color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-500", icon: <FaExclamationTriangle />, label: "Moderate" };
    if (aqi <= 300) return { color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-500", icon: <FaSmog />, label: "Poor" };
    if (aqi <= 400) return { color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-500", icon: <FaSkull />, label: "Very Poor" };
    return { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-600", icon: <FaSkull />, label: "Severe" };
  };
  const status = getStatusInfo(data.predicted_aqi);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden p-8 rounded-3xl shadow-xl backdrop-blur-xl border-2 ${status.border} ${status.bg} w-full text-center`}
    >
      {/* Background Icon Watermark */}
      <div className={`absolute -right-10 -bottom-10 text-9xl opacity-10 ${status.color}`}>
        {status.icon}
      </div>

      <h3 className="text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-widest text-sm mb-2">
        Air Quality Index (AQI)
      </h3> 
      
      <div className="flex justify-center items-center gap-4 mb-4">
      
        <span className={`text-6xl font-extrabold ${status.color} drop-shadow-sm`}>
          {Math.round(data.predicted_aqi)}
        </span>
      </div>

      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg border ${status.border} ${status.color} bg-white/50 dark:bg-black/20`}
      >
        {status.icon}
       
        <span>{data.air_quality_status}</span>
      </motion.div>

      <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
        Prediction for <span className="font-bold text-gray-700 dark:text-gray-200">{data.input_city}</span>
      </p>
    </motion.div>
  );
};

export default ResultCard;