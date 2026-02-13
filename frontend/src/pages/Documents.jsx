import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

const Documents = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Documents</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Documents;
