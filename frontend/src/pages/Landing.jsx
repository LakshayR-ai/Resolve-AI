import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Zap, Shield, BarChart3, FileText, MessageSquare, ArrowRight, CheckCircle2, Globe, Users, Sparkles } from 'lucide-react'

const fade = { hidden:{ opacity:0, y:28 }, show:{ opacity:1, y:0, transition:{ duration:.55 } } }
const stag = { hidden:{}, show:{ transition:{ staggerChildren:.09 } } }

const FEATURES = [
  { icon:Bot,         c:'#6C63FF', bg:'rgba(108,99,255,.12)', title:'Zero Hallucinations',      desc:'Answers only from your uploaded documents. Gemini 2.5 Flash with RAG ensures accuracy every time.' },
  { icon:FileText,    c:'#7C3AED', bg:'rgba(124,58,237,.12)', title:'Upload Any Format',        desc:'PDF, DOCX, TXT, CSV, Excel, Markdown — drag, drop, processed and indexed in seconds.' },
  { icon:Zap,         c:'#2563EB', bg:'rgba(37,99,235,.12)',  title:'Deploy in Minutes',        desc:'From first upload to a live customer-facing chatbot in under 5 minutes. No developers needed.' },
  { icon:BarChart3,   c:'#10B981', bg:'rgba(16,185,129,.12)', title:'Real-Time Analytics',      desc:'Track sentiment, issue categories, response times, satisfaction scores and knowledge gaps.' },
  { icon:Shield,      c:'#F59E0B', bg:'rgba(245,158,11,.12)', title:'Enterprise Security',      desc:'JWT authentication, isolated vector stores per company, encrypted storage at rest.' },
  { icon:Globe,       c:'#EF4444', bg:'rgba(239,68,68,.12)',  title:'Embeddable Anywhere',      desc:'One script tag or shareable link. Your AI chatbot lives on any website immediately.' },
]

const STEPS = [
  { n:'01', c:'#6C63FF', title:'Create Your Workspace',    desc:'Register in 30 seconds. Your fully isolated AI environment is created instantly — no setup required.' },
  { n:'02', c:'#7C3AED', title:'Upload Your Documents',    desc:'Drop in your PDFs, FAQs, manuals and policies. Our RAG pipeline automatically chunks, embeds and indexes everything.' },
  { n:'03', c:'#10B981', title:'Your AI Goes Live',        desc:'Share your link or copy the embed snippet. Customers immediately get accurate answers from your knowledge base.' },
]


export default function Landing() {
  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:'#080B14', color:'white',
      minHeight:'100vh', width:'100%', display:'block' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(8,11,20,0.9)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 40px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:66,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(108,99,255,0.4)' }}>
              <Bot size={18} color="white" />
            </div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
              fontSize:19, letterSpacing:'-0.03em', color:'white' }}>
              Resolve<span style={{ background:'linear-gradient(135deg,#A78BFA,#818CF8)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text' }}>AI</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Link to="/login" style={{ color:'rgba(255,255,255,0.65)', textDecoration:'none',
              fontSize:14, fontWeight:500, padding:'8px 14px' }}>Sign in</Link>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:7,
              padding:'9px 20px', background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              color:'white', borderRadius:10, textDecoration:'none', fontSize:14, fontWeight:600,
              boxShadow:'0 4px 16px rgba(108,99,255,0.45)' }}>
              Get Started Free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop:170, paddingBottom:100, textAlign:'center',
        position:'relative', overflow:'hidden', width:'100%' }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', top:'-5%', left:'-5%', width:'50%', height:'60%',
          borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none',
          background:'radial-gradient(circle, rgba(108,99,255,0.14) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', top:'10%', right:'-5%', width:'45%', height:'55%',
          borderRadius:'50%', filter:'blur(70px)', pointerEvents:'none',
          background:'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'30%', width:'40%', height:'50%',
          borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none',
          background:'radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)' }} />
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle, rgba(108,99,255,0.1) 1px, transparent 1px)',
          backgroundSize:'36px 36px' }} />

        <motion.div initial="hidden" animate="show" variants={stag}
          style={{ maxWidth:860, margin:'0 auto', padding:'0 24px', position:'relative' }}>

          <motion.div variants={fade}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px',
              borderRadius:99, marginBottom:28,
              background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.32)',
              fontSize:13, fontWeight:500, color:'#A78BFA' }}>
            <Sparkles size={13} /> 100% Free · No Credit Card · Powered by Gemini 2.5 Flash
          </motion.div>

          <motion.h1 variants={fade}
            style={{ fontSize:'clamp(46px,6.5vw,82px)',
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
              letterSpacing:'-0.045em', lineHeight:1.07, marginBottom:26, color:'white' }}>
            Build AI Customer Support<br />
            <span style={{ background:'linear-gradient(135deg,#6C63FF 0%,#A78BFA 45%,#2563EB 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Agents in Minutes
            </span>
          </motion.h1>

          <motion.p variants={fade}
            style={{ fontSize:19, color:'rgba(255,255,255,0.52)', lineHeight:1.7,
              maxWidth:560, margin:'0 auto 44px', fontWeight:400 }}>
            Upload your company documents. Configure your AI assistant.
            Deploy on your website — no coding required, completely free.
          </motion.p>

          <motion.div variants={fade}
            style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:22 }}>
            <Link to="/register"
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'15px 36px',
                background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:14,
                textDecoration:'none', fontSize:17, fontWeight:700,
                boxShadow:'0 10px 32px rgba(108,99,255,0.5)' }}>
              Start for Free <ArrowRight size={19} />
            </Link>
            <Link to="/login"
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'15px 30px',
                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.13)',
                color:'white', borderRadius:14, textDecoration:'none', fontSize:17, fontWeight:600,
                backdropFilter:'blur(10px)' }}>
              Sign In
            </Link>
          </motion.div>

          <motion.div variants={fade}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {['No credit card required', 'Completely free to use', 'Deploy in under 5 minutes'].map(t => (
              <span key={t} style={{ display:'flex', alignItems:'center', gap:7,
                fontSize:13, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>
                <CheckCircle2 size={14} color="#10B981" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        padding:'32px 24px', width:'100%',
        background:'rgba(255,255,255,0.03)' }}>
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.5 }}
          style={{ maxWidth:900, margin:'0 auto', display:'flex',
            justifyContent:'space-around', flexWrap:'wrap', gap:24 }}>
          {[
            { n:'5 min',    l:'Average setup time'       },
            { n:'100%',     l:'Free forever'             },
            { n:'Zero',     l:'Hallucinations'           },
            { n:'6+',       l:'Document formats'         },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign:'center' }}>
              <p style={{ fontSize:32, fontWeight:800, margin:'0 0 5px',
                fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.04em',
                background:'linear-gradient(135deg,#6C63FF,#A78BFA)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text' }}>{n}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:0 }}>{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding:'100px 24px', width:'100%' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stag}
            style={{ textAlign:'center', marginBottom:64 }}>
            <motion.div variants={fade}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px',
                borderRadius:99, marginBottom:20,
                background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.28)',
                fontSize:13, fontWeight:500, color:'#34D399' }}>
              Everything included for free
            </motion.div>
            <motion.h2 variants={fade}
              style={{ fontSize:'clamp(30px,4vw,52px)', fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontWeight:800, letterSpacing:'-0.035em', lineHeight:1.1, marginBottom:16 }}>
              All the tools you need
            </motion.h2>
            <motion.p variants={fade}
              style={{ fontSize:17, color:'rgba(255,255,255,0.48)', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
              One platform. Every tool your support team needs. All free.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stag}
            style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {FEATURES.map(({ icon:Icon, c, bg, title, desc }, i) => (
              <motion.div key={i} variants={fade}
                style={{ padding:28, borderRadius:18, cursor:'default',
                  background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  transition:'all .25s ease' }}
                whileHover={{ background:'rgba(255,255,255,0.07)',
                  borderColor:`${c}55`, y:-6,
                  boxShadow:`0 12px 40px ${c}22` }}>
                <div style={{ width:48, height:48, borderRadius:13, marginBottom:18, background:bg,
                  border:`1px solid ${c}44`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={22} color={c} />
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10,
                  fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.02em' }}>{title}</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.48)', lineHeight:1.7, margin:0 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'80px 24px', width:'100%',
        background:'rgba(255,255,255,0.02)',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stag}
            style={{ textAlign:'center', marginBottom:60 }}>
            <motion.h2 variants={fade}
              style={{ fontSize:'clamp(28px,4vw,50px)', fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontWeight:800, letterSpacing:'-0.035em', marginBottom:14 }}>
              Up and running in 3 steps
            </motion.h2>
            <motion.p variants={fade}
              style={{ fontSize:16, color:'rgba(255,255,255,0.45)', maxWidth:440, margin:'0 auto' }}>
              No technical skills needed. No credit card. No waiting.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stag}
            style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:36 }}>
            {STEPS.map(({ n, c, title, desc }, i) => (
              <motion.div key={i} variants={fade}
                style={{ padding:'28px 24px', borderRadius:18,
                  background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-10, right:-10, fontSize:80, fontWeight:900,
                  fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.05em',
                  color:c, opacity:0.06, lineHeight:1, userSelect:'none' }}>{n}</div>
                <div style={{ fontSize:44, fontWeight:900, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  letterSpacing:'-0.05em', color:c, marginBottom:16, lineHeight:1 }}>{n}</div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10,
                  fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.48)', lineHeight:1.7, margin:0 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FREE CTA ── */}
      <section style={{ padding:'80px 24px', width:'100%' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stag}
            style={{ padding:'60px 48px', borderRadius:24, textAlign:'center',
              background:'linear-gradient(135deg,rgba(108,99,255,0.16),rgba(124,58,237,0.1))',
              border:'1px solid rgba(108,99,255,0.28)' }}>
            <motion.div variants={fade}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px',
                borderRadius:99, marginBottom:22,
                background:'rgba(16,185,129,0.14)', border:'1px solid rgba(16,185,129,0.3)',
                fontSize:13, fontWeight:600, color:'#34D399' }}>
              <CheckCircle2 size={13} /> 100% Free — No hidden charges
            </motion.div>
            <motion.h2 variants={fade}
              style={{ fontSize:'clamp(28px,3.5vw,46px)', fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontWeight:800, letterSpacing:'-0.035em', lineHeight:1.1, marginBottom:16 }}>
              Ready to deploy your AI?
            </motion.h2>
            <motion.p variants={fade}
              style={{ fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:36 }}>
              Join businesses using ResolveAI to automate customer support.
              Free forever. No credit card. No limits on getting started.
            </motion.p>
            <motion.div variants={fade}>
              <Link to="/register"
                style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'15px 40px',
                  background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:14,
                  textDecoration:'none', fontSize:17, fontWeight:700,
                  boxShadow:'0 10px 32px rgba(108,99,255,0.5)' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'32px 24px',
        width:'100%', background:'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', display:'flex',
          flexDirection:'column', alignItems:'center', gap:20 }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={15} color="white" />
            </div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700,
              fontSize:15, color:'white' }}>
              Resolve<span style={{ color:'#A78BFA' }}>AI</span>
            </span>
          </div>

          {/* Links */}
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            {[['Sign In','/login'],['Register','/register']].map(([l,u]) => (
              <Link key={l} to={u} style={{ fontSize:13, color:'rgba(255,255,255,0.45)',
                textDecoration:'none', fontWeight:500, transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>{l}</Link>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)', margin:0 }}>
            © 2025 ResolveAI · Free for everyone
          </p>
        </div>
      </footer>
    </div>
  )
}
