import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCity, FaCloudSun, FaSpinner } from 'react-icons/fa';

const AQIForm = ({ onSubmit, loading }) => {
  const [temp, setTemp] = useState(null);

  const cities = [
    "Ahmedabad", "Aizawl", "Amaravati", "Amritsar", "Bengaluru", "Bhopal",
    "Brajrajnagar", "Chandigarh", "Chennai", "Coimbatore", "Delhi", "Ernakulam",
    "Gurugram", "Guwahati", "Hyderabad", "Jaipur", "Jorapokhar", "Kochi",
    "Kolkata", "Lucknow", "Mumbai", "Patna", "Shillong", "Talcher",
    "Thiruvananthapuram", "Visakhapatnam"
  ];

  const handleCityChange = async (e) => {
    const city = e.target.value;
    if (!city) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/weather/${city}`);
      const data = await response.json();
      if (data.temperature) setTemp(data.temperature);
    } catch (error) { setTemp(null); }
  };

  // Modern Input Styles with Larger Font
  const inputClasses = "w-full bg-gray-50/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100 px-5 pt-7 pb-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-lg font-medium shadow-sm";
  const labelClasses = "absolute left-5 top-2 text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider pointer-events-none transition-all";

  return (
    <motion.div
      className="glass p-8 rounded-[32px] shadow-2xl w-full max-w-lg relative overflow-hidden"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Weather Badge */}
      {temp && (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-6 right-6 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-600 dark:text-orange-300 px-4 py-1.5 rounded-full text-base font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-500/20 shadow-sm"
        >
          <FaCloudSun className="text-xl" /> {temp}°C
        </motion.div>
      )}

      <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
        <span className="bg-gradient-to-b from-blue-500 to-blue-600 w-1.5 h-10 rounded-full shadow-lg shadow-blue-500/40"></span>
        Input Parameters
      </h3>
      
      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* City Select */}
        <div className="relative group">
          <FaCity className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
          <select
            name="state"
            onChange={handleCityChange}
            defaultValue=""
            className="w-full bg-gray-50/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100 pl-14 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-lg font-medium appearance-none cursor-pointer shadow-sm"
            required
          >
            <option value="" disabled>Select City / Region</option>
            {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* PM Inputs */}
        <div className="grid grid-cols-2 gap-5">
          <div className="relative group">
            <span className={labelClasses}>PM2.5</span>
            <input name="pm25" type="number" step="0.01" className={inputClasses} placeholder=" " required />
          </div>
          <div className="relative group">
            <span className={labelClasses}>PM10</span>
            <input name="pm10" type="number" step="0.01" className={inputClasses} placeholder=" " required />
          </div>
        </div>

        {/* Other Gases */}
        <div className="grid grid-cols-2 gap-5">
            {['NO2', 'CO', 'SO2', 'O3'].map((gas) => (
                <div key={gas} className="relative group">
                    <span className={labelClasses}>{gas}</span>
                    <input name={gas.toLowerCase()} type="number" step="0.01" className={inputClasses} placeholder=" " required />
                </div>
            ))}
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-xl mt-4"
        >
          {loading ? <><FaSpinner className="animate-spin text-2xl" /> Analyzing...</> : 'Predict Air Quality'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AQIForm;