import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Zap, Shield, BarChart3, FileText, MessageSquare, ArrowRight, CheckCircle, Globe } from 'lucide-react'

const fade  = { hidden:{ opacity:0, y:24 }, show:{ opacity:1, y:0, transition:{ duration:.5 } } }
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.1 } } }

const FEATURES = [
  { icon:Bot,         c:'#6C63FF', title:'AI-Powered Answers',    desc:'Gemini 2.5 Flash answers from your exact documents. Zero hallucinations.' },
  { icon:FileText,    c:'#7C3AED', title:'Upload Any Document',   desc:'PDF, DOCX, TXT, CSV, Excel — drag, drop, processed instantly.' },
  { icon:Zap,         c:'#2563EB', title:'Deploy in Minutes',     desc:'From upload to live chatbot in under 5 minutes. No code.' },
  { icon:BarChart3,   c:'#10B981', title:'Deep Analytics',        desc:'Sentiment, categories, response times — all in real time.' },
  { icon:Shield,      c:'#F59E0B', title:'Enterprise Security',   desc:'JWT, isolated vector stores, encrypted at rest.' },
  { icon:Globe,       c:'#EF4444', title:'Embeddable Widget',     desc:'One script tag. Deploy on any website immediately.' },
]

const STEPS = [
  { n:'01', title:'Register & Create Workspace', desc:'Sign up in 30 seconds. Your isolated AI environment is ready.' },
  { n:'02', title:'Upload Your Documents',        desc:'Drop PDFs, FAQs, manuals. RAG pipeline processes automatically.' },
  { n:'03', title:'Your AI Goes Live',            desc:'Share the link or embed. Customers get instant accurate answers.' },
]

const PRICING = [
  { name:'Starter',    price:'$29',    features:['1,000 chats/mo','5 documents','Basic analytics','Email support'], color:'#6C63FF' },
  { name:'Growth',     price:'$79',    features:['10,000 chats/mo','50 documents','Advanced analytics','Priority support','Custom branding'], color:'#7C3AED', popular:true },
  { name:'Enterprise', price:'Custom', features:['Unlimited chats','Unlimited docs','Dedicated support','SLA','Custom integrations'], color:'#2563EB' },
]

const S = { // shared inline style helpers
  section: { padding:'100px 24px', maxWidth:1100, margin:'0 auto' },
  chip:    { display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:99, fontSize:13, fontWeight:500, marginBottom:24 },
  h2:      { fontSize:'clamp(32px,4vw,52px)', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:18 },
  sub:     { fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:520, marginBottom:48 },
}

export default function Landing() {
  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:'#080B14', color:'white', minHeight:'100vh' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(8,11,20,0.88)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={18} color="white" />
            </div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18, letterSpacing:'-0.03em' }}>
              Resolve<span style={{ background:'linear-gradient(135deg,#A78BFA,#818CF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>AI</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Link to="/login" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:14, fontWeight:500 }}>Sign in</Link>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px',
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:10,
              textDecoration:'none', fontSize:14, fontWeight:600, boxShadow:'0 4px 14px rgba(108,99,255,0.4)' }}>
              Start Free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop:160, paddingBottom:100, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'5%', left:'10%', width:600, height:600, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'0%', right:'5%', width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          filter:'blur(60px)', pointerEvents:'none' }} />

        <motion.div initial="hidden" animate="show" variants={stagger}
          style={{ maxWidth:820, margin:'0 auto', padding:'0 24px', position:'relative' }}>
          <motion.div variants={fade} style={{ ...S.chip,
            background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)', color:'#A78BFA' }}>
            <Zap size={13} /> Powered by Gemini 2.5 Flash
          </motion.div>
          <motion.h1 variants={fade} style={{ fontSize:'clamp(44px,6vw,78px)',
            fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
            letterSpacing:'-0.04em', lineHeight:1.06, marginBottom:24 }}>
            Build AI Customer Support<br />
            <span style={{ background:'linear-gradient(135deg,#6C63FF 0%,#A78BFA 50%,#2563EB 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Agents in Minutes
            </span>
          </motion.h1>
          <motion.p variants={fade} style={{ ...S.sub, margin:'0 auto 40px' }}>
            Upload your company documents. Configure your AI assistant.
            Deploy on your website — no coding required.
          </motion.p>
          <motion.div variants={fade} style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px',
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:14,
              textDecoration:'none', fontSize:16, fontWeight:700,
              boxShadow:'0 8px 28px rgba(108,99,255,0.45)' }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px',
              background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
              color:'white', borderRadius:14, textDecoration:'none', fontSize:16, fontWeight:600,
              backdropFilter:'blur(10px)' }}>
              View Demo
            </Link>
          </motion.div>
          <motion.p variants={fade} style={{ marginTop:20, fontSize:13, color:'rgba(255,255,255,0.3)' }}>
            No credit card · Free 14-day trial · Cancel anytime
          </motion.p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ ...S.section, background:'transparent' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ textAlign:'center', marginBottom:64 }}>
          <motion.div variants={fade} style={{ ...S.chip,
            background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#34D399' }}>
            Features
          </motion.div>
          <motion.h2 variants={fade} style={S.h2}>Everything you need</motion.h2>
          <motion.p variants={fade} style={{ ...S.sub, margin:'0 auto' }}>
            One platform. Every tool your support team needs.
          </motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
          {FEATURES.map(({ icon:Icon, c, title, desc }, i) => (
            <motion.div key={i} variants={fade}
              style={{ padding:28, borderRadius:16, background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)', transition:'all .2s ease' }}
              whileHover={{ background:'rgba(255,255,255,0.06)', borderColor:c+'44',
                boxShadow:`0 8px 32px ${c}22`, y:-4 }}>
              <div style={{ width:44, height:44, borderRadius:12, marginBottom:16,
                background:`linear-gradient(135deg,${c}22,${c}11)`,
                border:`1px solid ${c}33`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={20} color={c} />
              </div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8,
                fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.02em' }}>{title}</h3>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...S.section }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ textAlign:'center', marginBottom:64 }}>
          <motion.div variants={fade} style={{ ...S.chip,
            background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.25)', color:'#A78BFA' }}>
            How it Works
          </motion.div>
          <motion.h2 variants={fade} style={S.h2}>Live in 3 steps</motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:32 }}>
          {STEPS.map(({ n, title, desc }, i) => (
            <motion.div key={i} variants={fade} style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
              <div style={{ fontSize:48, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1,
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                background:'linear-gradient(135deg,#6C63FF,#7C3AED)', WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent', backgroundClip:'text', flexShrink:0 }}>{n}</div>
              <div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8,
                  fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PRICING */}
      <section style={{ ...S.section }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ textAlign:'center', marginBottom:64 }}>
          <motion.h2 variants={fade} style={S.h2}>Simple, transparent pricing</motion.h2>
          <motion.p variants={fade} style={{ ...S.sub, margin:'0 auto' }}>Start free. Scale when you grow.</motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {PRICING.map(({ name, price, features, color, popular }, i) => (
            <motion.div key={i} variants={fade}
              style={{ padding:32, borderRadius:20,
                background: popular ? `linear-gradient(135deg,${color}22,${color}11)` : 'rgba(255,255,255,0.03)',
                border:`1px solid ${popular ? color+'55' : 'rgba(255,255,255,0.08)'}`,
                position:'relative', boxShadow: popular ? `0 16px 48px ${color}22` : 'none' }}>
              {popular && (
                <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                  background:`linear-gradient(135deg,${color},#7C3AED)`, color:'white',
                  fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:99,
                  textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8,
                fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{name}</h3>
              <div style={{ fontSize:42, fontWeight:900, fontFamily:"'Plus Jakarta Sans',sans-serif",
                letterSpacing:'-0.04em', color, marginBottom:24 }}>{price}<span style={{ fontSize:16, fontWeight:500, color:'rgba(255,255,255,0.4)' }}>/mo</span></div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {features.map((f,j) => (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(255,255,255,0.7)' }}>
                    <CheckCircle size={15} color={color} /> {f}
                  </div>
                ))}
              </div>
              <Link to="/register" style={{ display:'block', textAlign:'center', padding:'12px',
                background: popular ? `linear-gradient(135deg,${color},#7C3AED)` : 'rgba(255,255,255,0.08)',
                color:'white', borderRadius:10, textDecoration:'none', fontWeight:600, fontSize:14,
                boxShadow: popular ? `0 6px 20px ${color}44` : 'none' }}>
                Get Started
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', textAlign:'center' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          style={{ maxWidth:600, margin:'0 auto', padding:60, borderRadius:24,
            background:'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(124,58,237,0.1))',
            border:'1px solid rgba(108,99,255,0.25)' }}>
          <motion.h2 variants={fade} style={{ ...S.h2, marginBottom:14 }}>
            Ready to launch your AI?
          </motion.h2>
          <motion.p variants={fade} style={{ ...S.sub, margin:'0 auto 32px' }}>
            Join businesses already using ResolveAI to automate customer support.
          </motion.p>
          <motion.div variants={fade}>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 36px',
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:14,
              textDecoration:'none', fontSize:16, fontWeight:700,
              boxShadow:'0 8px 28px rgba(108,99,255,0.45)' }}>
              Start for Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px', textAlign:'center',
        fontSize:13, color:'rgba(255,255,255,0.3)' }}>
        © 2025 ResolveAI · Built for modern businesses
      </footer>
    </div>
  )
}
