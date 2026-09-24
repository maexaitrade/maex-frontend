import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Check, Globe2, Layers3,
  Menu, Network, Plus, ScanLine, ShieldCheck, X, Zap,
} from 'lucide-react';
import './landing.css';

const navItems = [
  { label: 'Why MAEX', href: '#platform' },
  { label: 'How it works', href: '#process' },
  { label: 'Plans', href: '#packages' },
  { label: 'Safety', href: '#trust' },
];

const faqs = [
  {
    question: 'Is MAEX a trading exchange?',
    answer: 'No. MAEX is a crypto payment and investment platform. It gives you one simple place to deposit, follow your activity, and view your plan.',
  },
  {
    question: 'What happens after I deposit?',
    answer: 'Your payment is confirmed, your chosen plan is activated, and your account shows the latest status.',
  },
  {
    question: 'Can I withdraw my funds?',
    answer: 'Withdrawals follow the rules shown in your account. You stay in control of your wallet and withdrawal requests.',
  },
  {
    question: 'Are returns guaranteed?',
    answer: 'No. ROI figures are targets only. Crypto and investment products carry risk.',
  },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `reveal${visible ? ' is-visible' : ''}` };
}

function dailyVolume() {
  const seed = new Date().toISOString().slice(0, 10); // changes each day
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  const ratio = (Math.abs(h) >>> 0) / 0xffffffff;
  return Math.floor(20000 + ratio * 30001); // $20,000–$50,000
}

const VOL = dailyVolume();
const VOL_FMT = '$' + VOL.toLocaleString();
const VOL_PCT = '+' + (2 + ((Math.abs(VOL) % 93) / 10).toFixed(1)) + '%';

function CountUp({ value, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const duration = 1300;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setCount(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}

function ScrollButton({ href, children, primary = false }) {
  return (
    <a className={primary ? 'button-primary' : 'button-ghost'} href={href}>
      {children}
      <ArrowUpRight size={15} strokeWidth={1.8} />
    </a>
  );
}

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <a href="#top" className="brand">
          <span className="brand-mark">M</span>
          <span>MAEX / TRADE</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>{item.label}</a>
          ))}
          <Link className="nav-link" to="/login">Log in</Link>
        </nav>
        <Link className="nav-action" to="/register">
          Get started <ArrowUpRight size={14} />
        </Link>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link className="mobile-nav-cta" to="/register" onClick={() => setMenuOpen(false)}>
            Get started <ArrowUpRight size={14} />
          </Link>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  const bars = [34, 48, 42, 58, 49, 66, 54, 71, 62, 80, 66, 89, 76, 94, 83, 100, 91, 104, 98, 111];
  return (
    <>
      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="usdt-coin" aria-hidden="true">
              <div className="coin-rim" />
              <div className="coin-face">
                <span>₮</span>
                <small>USDT</small>
              </div>
            </div>
            <span className="eyebrow reveal is-visible">A clearer way to use crypto</span>
            <h1 className="display reveal is-visible delay-1">Crypto payments.<br />Clear <em>plans.</em></h1>
            <p className="hero-lead reveal is-visible delay-2">
              Make payments, track your balance, and follow every transaction in one simple place.
            </p>
            <div className="hero-actions reveal is-visible delay-3">
              <ScrollButton href="#packages" primary>View the plans</ScrollButton>
              <ScrollButton href="#process">How it works</ScrollButton>
            </div>
            <div className="hero-note reveal is-visible delay-3">
              <span><Check size={13} /> Easy to follow</span>
              <span>No hidden fees</span>
            </div>
          </div>
          <div className="terminal reveal is-visible delay-2" aria-label="MAEX platform activity preview">
            <div className="terminal-top">
              <span>MAEX / LIVE OVERVIEW</span>
              <span className="terminal-status"><i /> LIVE SYSTEM</span>
            </div>
            <div className="terminal-body">
              <span className="terminal-kicker">Volume today</span>
              <div className="terminal-value">{VOL_FMT} <small>{VOL_PCT}</small></div>
              <div className="sparkline" aria-hidden="true">
                {bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
              </div>
              <div className="terminal-bottom">
                <div className="terminal-metric"><small>System status</small><strong className="green">Online</strong></div>
                <div className="terminal-metric"><small>Settlement time</small><strong>1.8 sec</strong></div>
                <div className="terminal-metric"><small>Payment routes</small><strong>34</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="ticker">
        <div className="container ticker-row">
          <div className="ticker-item"><span className="ticker-label">Volume today</span><span className="ticker-value">{VOL_FMT} <b>{VOL_PCT}</b></span></div>
          <div className="ticker-item"><span className="ticker-label">Average settlement</span><span className="ticker-value">1.8 sec <b>live</b></span></div>
          <div className="ticker-item"><span className="ticker-label">Payment routes</span><span className="ticker-value">34 <b>active</b></span></div>
          <div className="ticker-item"><span className="ticker-label">System uptime</span><span className="ticker-value">99.98% <b>tracked</b></span></div>
        </div>
      </div>
    </>
  );
}

function Platform() {
  const reveal = useReveal();
  const features = [
    { icon: Network, number: '01', title: 'Real-time payments', body: 'See when a payment starts, moves, and settles.' },
    { icon: ShieldCheck, number: '02', title: 'Clear account view', body: 'Check your balance and activity without searching across tools.' },
    { icon: Activity, number: '03', title: 'Growth you can follow', body: 'Track referrals, team progress, and rewards in one place.' },
    { icon: Layers3, number: '04', title: 'Reports you can trust', body: 'See updates as they happen, with no hidden numbers.' },
  ];
  return (
    <section className="section" id="platform">
      <div className="container">
        <div className="section-heading" ref={reveal.ref}>
          <div className={reveal.className}><span className="eyebrow">Why MAEX</span><h2 className="display">Everything you need<br />to use crypto with <em style={{ color: '#c7ff42', fontStyle: 'normal' }}>confidence.</em></h2></div>
          <p className={reveal.className}>MAEX brings payments, balances, and progress into one clear view.</p>
        </div>
        <div className="feature-layout">
          <div className="feature-rail reveal">
            <div className="feature-index"><span>04</span> / KEY FEATURES</div>
            <h3>Simple by<br />design.</h3>
            <p>Crypto should be easier to understand. MAEX shows you what is happening, step by step.</p>
          </div>
          <div className="feature-list">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div className={`feature-card reveal delay-${Math.min(index + 1, 3)}`} key={feature.number}>
                  <span className="feature-number">{feature.number}</span>
                  <div><h3>{feature.title}</h3><p>{feature.body}</p></div>
                  <Icon className="feature-icon" size={19} strokeWidth={1.5} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { number: '01 / DEPOSIT', icon: Globe2, title: 'Add crypto', body: 'Connect your wallet and deposit through the supported payment gateway.' },
    { number: '02 / CHOOSE', icon: ScanLine, title: 'Pick a plan', body: 'Choose a package that fits your starting amount and goals.' },
    { number: '03 / GROW', icon: Zap, title: 'Track your progress', body: 'See your balance, referrals, and rewards as your account grows.' },
  ];
  return (
    <section className="section alt" id="process">
      <div className="container">
        <div className="section-heading reveal"><div><span className="eyebrow">How it works</span><h2 className="display">Start in three<br /><em style={{ color: '#c7ff42', fontStyle: 'normal' }}>simple steps.</em></h2></div><p>From your first deposit to your first reward, each step is easy to follow.</p></div>
        <div className="process-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return <div className={`process-item reveal delay-${index + 1}`} key={step.number}><span className="process-number">{step.number}</span><Icon size={25} strokeWidth={1.4} color="#c7ff42" style={{ marginTop: 31 }} /><h3>{step.title}</h3><p>{step.body}</p></div>;
          })}
        </div>
      </div>
    </section>
  );
}

function ProofBand() {
  return (
    <section className="stat-band" aria-label="MAEX proof points">
      <div className="container stat-grid">
        <div className="stat-intro">The numbers<br />stay visible.</div>
        <div className="stat"><span className="stat-value">{VOL_FMT}</span><span className="stat-label">Volume today</span></div>
        <div className="stat"><span className="stat-value"><CountUp value={34} /></span><span className="stat-label">Payment routes</span></div>
        <div className="stat"><span className="stat-value"><CountUp value={99.98} suffix="%" decimals={2} /></span><span className="stat-label">System uptime</span></div>
      </div>
    </section>
  );
}

function Packages() {
  const packages = [
    { title: 'Starter', tag: 'For new members', range: '$100 — $5,000', roi: '1%', body: 'Start earning daily ROI. Top up anytime — your balance accumulates and your returns grow with it.' },
    { title: 'Premium', tag: 'For serious investors', range: '$5,000+', roi: '1.5%', body: 'Higher daily returns for larger balances. Automatically activated when your total crosses $5,000.' },
  ];
  return (
    <section className="section" id="packages">
      <div className="container package-layout">
        <div className="package-copy reveal"><span className="eyebrow">Plans</span><h2 className="display">Choose a plan<br /><em>that fits.</em></h2><p>Start small or grow with your team. Every plan shows the amount needed and the daily ROI target before you begin.</p><span className="package-disclaimer">ROI is a target, not a guarantee. Review the full terms before investing.</span><Link to="/register" className="button-ghost" style={{ marginTop: 25 }}>Get started <ArrowRight size={15} /></Link></div>
        <div className="package-list">
          {packages.map((item, index) => <Link className={`package reveal delay-${Math.min(index + 1, 3)}`} to="/register" key={item.title}><div className="package-main"><div className="package-kicker"><span className="package-number">0{index + 1}</span><span>{item.tag}</span></div><h3>{item.title}</h3><p>{item.body}</p></div><div className="package-side"><div><span className="package-label">Deposit range</span><strong>{item.range}</strong></div><div><span className="package-label">Daily ROI target</span><strong className="package-roi">{item.roi}</strong></div><ArrowRight size={19} className="package-arrow" /></div></Link>)}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section alt" id="trust">
      <div className="container trust-layout">
        <div className="trust-copy reveal"><span className="eyebrow">Why choose MAEX</span><h2 className="display">Clear rules.<br /><em style={{ color: '#c7ff42', fontStyle: 'normal' }}>Clear updates.</em></h2><p>You should know where your money goes, what your account is doing, and how withdrawals work. MAEX keeps the important details visible.</p><div className="trust-quote">“No hidden fees. No confusing promises.”<br /><span className="muted">— the MAEX promise</span></div></div>
        <div className="faq-list reveal delay-1">
          {faqs.map((faq, index) => {
            const isOpen = index === open;
            return <div className={`faq${isOpen ? ' open' : ''}`} key={faq.question}><button className="faq-button" type="button" onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}><span>{faq.question}</span><Plus size={18} /></button><div className="faq-answer">{faq.answer}</div></div>;
          })}
        </div>
      </div>
    </section>
  );
}

function Briefing() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const submit = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('success');
  };
  return (
    <section className="capture" id="briefing">
      <div className="container capture-grid">
        <div className="reveal"><span className="eyebrow">Stay updated</span><h2 className="display">Get the<br /><em style={{ color: '#c7ff42', fontStyle: 'normal' }}>MAEX update.</em></h2></div>
        <div className="reveal delay-1"><p>Get simple updates about new plans, payment features, and platform progress. No spam.</p><form className="capture-form" onSubmit={submit} noValidate><input type="email" placeholder="your@email.com" aria-label="Email address" value={email} onChange={(event) => { setEmail(event.target.value); setStatus('idle'); }} /><button type="submit" aria-label="Join the briefing list"><ArrowRight size={20} /></button></form>{status === 'error' && <p className="capture-error">Enter a valid email address to join.</p>}{status === 'success' && <p className="capture-success"><Check size={14} style={{ verticalAlign: 'middle' }} /> Thanks — you're on the list.</p>}</div>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div className="footer-brand"><a href="#top" className="brand"><span className="brand-mark">M</span><span>MAEX / TRADE</span></a><p>Simple crypto payments and clear investment plans.</p></div><nav className="footer-links" aria-label="Footer navigation">{navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}<Link to="/login">Log in</Link></nav></div><div className="footer-bottom"><span>© 2026 MAEX Trade.</span><span>System status: online</span></div></div></footer>;
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="maex-page">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <Platform />
      <Process />
      <ProofBand />
      <Packages />
      <Trust />
      <Briefing />
      <Footer />
      <Link to="/register" className="mobile-cta">Get started <ArrowUpRight size={14} /></Link>
    </main>
  );
}
