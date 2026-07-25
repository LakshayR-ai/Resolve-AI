import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-page)' }}>
      <Sidebar />
      <motion.main
        style={{ flex:1, overflow:'auto', minWidth:0 }}
        initial={{ opacity:0, y:6 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:.3, ease:[.25,.46,.45,.94] }}>
        {children}
      </motion.main>
    </div>
  )
}
