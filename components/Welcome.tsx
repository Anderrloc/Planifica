import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-12"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center"
          >
            <div className="bg-red-50 p-4 rounded-full">
              <Sparkles className="w-12 h-12 text-red-600" />
            </div>
          </motion.div>
          
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            BIENVENIDOS DOCENTES DE LA <br />
            <span className="text-red-600">Anderson Welcome</span>
          </h1>
        </div>

        <div className="pt-20"> {/* Equivalent to about 5cm of space */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="space-y-2"
          >
            <p className="text-xl font-bold text-slate-700">
              DISEÑADO POR: ANDERSON MONDRAGON
            </p>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">
              PROFESOR DE INNOVACIÓN PEDAGÓGICA (PIP)
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
