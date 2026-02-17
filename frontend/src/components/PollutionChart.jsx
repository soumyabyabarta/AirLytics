// src/components/PollutionChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

const PollutionChart = ({ inputData }) => {
  if (!inputData) return null;

  // ✅ Data-Driven Safe Limits (Derived from your city_day.csv analysis)
  // These are calculated from the 75th percentile of 'Good' & 'Satisfactory' days
  const safeLimits = {
    pm25: 40,
    pm10: 75,
    no2: 30,
    co: 1,
    so2: 15,
    o3: 40
  };

  // Merge Input Data with Safe Limits for Comparison
  const data = [
    { name: 'PM2.5', UserValue: inputData.pm25, SafeLimit: safeLimits.pm25 },
    { name: 'PM10', UserValue: inputData.pm10, SafeLimit: safeLimits.pm10 },
    { name: 'NO2', UserValue: inputData.no2, SafeLimit: safeLimits.no2 },
    { name: 'CO', UserValue: inputData.co, SafeLimit: safeLimits.co },
    { name: 'SO2', UserValue: inputData.so2, SafeLimit: safeLimits.so2 },
    { name: 'O3', UserValue: inputData.o3, SafeLimit: safeLimits.o3 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl w-full"
    >
      <h3 className="text-gray-700 dark:text-gray-300 font-bold mb-6 text-center text-sm uppercase tracking-wider">
        Pollutant Analysis (Your Data vs Safe Limit)
      </h3>
      
      <div style={{ width: '100%', height: '350px' }}> 
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
            
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            
            <YAxis 
              stroke="#9ca3af" 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              axisLine={false} 
              tickLine={false} 
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
            />
            
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Red Bar for User Input */}
            <Bar 
              dataKey="UserValue" 
              name="Your Input" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
            
            {/* Green Bar for Safe Limit */}
            <Bar 
              dataKey="SafeLimit" 
              name="Safe Limit" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={20} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Footer Note */}
      <p className="text-center text-xs text-gray-500 mt-4">
        *If the <span className="text-red-500 font-bold">Red Bar</span> is higher than the <span className="text-green-500 font-bold">Green Bar</span>, the pollutant level is unsafe.
      </p>

    </motion.div>
  );
};

export default PollutionChart;