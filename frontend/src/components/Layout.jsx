import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Sidebar />
      <motion.main
        className="flex-1 overflow-auto min-w-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.main>
    </div>
  )
}
