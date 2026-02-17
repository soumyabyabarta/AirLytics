// src/App.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AQIForm from './components/AQIForm';
import ResultCard from './components/ResultCard';
import PollutionChart from './components/PollutionChart';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [result, setResult] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("Connecting to server...");

  // Loading Messages
  const funnyMessages = [
    "Waking up the AI...(It was napping) 😴",
    "Your time is very important to us...Please wait while we ignore you.",
    "Don't panic...Just count to infinite",
    "Please wait, Your PC is not a superman",
    "Thala for a reason 7",
  ];

  // Effect to cycle through funny messages
  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      interval = setInterval(() => {
        setLoadingMsg(funnyMessages[i % funnyMessages.length]);
        i++;
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData.entries());

    const payload = {
      state: rawData.state,
      month: new Date().getMonth() + 1,
      pm25: parseFloat(rawData.pm25),
      pm10: parseFloat(rawData.pm10),
      no2: parseFloat(rawData.no2),
      co: parseFloat(rawData.co),
      so2: parseFloat(rawData.so2),
      o3: parseFloat(rawData.o3),
    };

    setInputData(payload);

    try {
      // Live Render Backend URL
      const response = await fetch('https://airlytics-backend.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Server Error');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Backend connection failed! The server might be sleeping (Free Tier). Please try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  };

  // Health Advice Generator
  const getHealthAdvice = (aqi) => {
    if (aqi <= 50) return { emoji: "🏃", text: "Air is great! Perfect time for a run or outdoor yoga." };
    if (aqi <= 100) return { emoji: "🙂", text: "Air is okay. Sensitive people should be careful." };
    if (aqi <= 200) return { emoji: "😷", text: "Wear a mask if you have asthma. Reduce long outdoor activities." };
    if (aqi <= 300) return { emoji: "⚠️", text: "Unhealthy! Avoid outdoor exercise. Keep windows closed." };
    if (aqi <= 400) return { emoji: "☠️", text: "Very Poor! Stay indoors. Use an Air Purifier immediately." };
    return { emoji: "☣️", text: "Hazardous! Emergency conditions. Do not go outside." };
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto z-50">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 cursor-pointer"
        >
          AirLytics<span className="text-xs align-top opacity-70">PRO</span>
        </motion.h1>
        <ThemeToggle />
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 flex flex-col items-center gap-10">
        
        {/* Hero Section */}
     <motion.div 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="text-center max-w-3xl mx-auto mb-12"
>
  <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
    Breathe <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Smarter</span>
  </h2>
  <p className="text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed">
    Advanced AI-powered air quality prediction system with real-time meteorological integration
  </p>
</motion.div>

        {/*  Safe Limits Reference Card (Updated) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border-l-4 border-green-500 w-full max-w-4xl"
        >
          <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">Optimal Safe Limits</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center text-sm">
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">PM 2.5: <b>40</b></div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">PM 10: <b>75</b></div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">NO2: <b>30</b></div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">CO: <b>1</b></div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">SO2: <b>15</b></div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">O3: <b>40</b></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl items-start">
            
            {/* Input Form */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center w-full"
            >
                <AQIForm onSubmit={handlePredict} loading={loading} />
            </motion.div>

            {/* Results Section */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-6 w-full"
            >
                {/* Funny Loading State */}
                {loading && (
                   <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-200">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-lg font-medium animate-pulse text-blue-600 dark:text-blue-400 text-center">
                        {loadingMsg}
                      </p>
                   </div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-center shadow-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                {/* Results & Charts */}
                {result && !loading && (
                  <>
                    <ResultCard data={result} />
                    
                    {/* Health Advice */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white"
                    >
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        {getHealthAdvice(result.predicted_aqi).emoji} Health Advice
                      </h3>
                      <p className="text-lg opacity-90">
                        {getHealthAdvice(result.predicted_aqi).text}
                      </p>
                    </motion.div>

                    {/* Comparison Chart */}
                    {inputData && <PollutionChart inputData={inputData} />}
                  </>
                )}
                
                {/* Idle State */}
                {!result && !inputData && !loading && (
                  <div className="hidden lg:flex h-full items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-gray-400 text-center">
                    <div>
                      <span className="text-4xl block mb-2">📊</span>
                      Enter pollutant data to visualize analytics here
                    </div>
                  </div>
                )}
            </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-sm text-gray-500 dark:text-gray-600">
        &copy; {new Date().getFullYear()} AirLytics. Built with ❤️
      </footer>
    </div>
  );
}

export default App;