import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
