import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Menu, Search, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import { api, apiPaginated, type Category, type PaginationMeta, type Service } from './api';
import Dashboard, { type DashboardUser } from './dashboard';
import DateTimePicker from './date-time-picker';
import './styles.css';
import './auth.css';
import './motion.css';
import './catalog.css';
import './responsive.css';

type User = DashboardUser;
type View = 'home' | 'services';
type Toast = { message: string; type: 'success' | 'error' };

const heroSlides = [
  { image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200', alt: 'A trusted professional providing a home cleaning service' },
  { image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200', alt: 'A relaxing professional wellness service' },
  { image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200', alt: 'A happy dog receiving trusted local pet care' },
];

const categoryImages: Record<string, string> = {
  'Home Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700',
  'Beauty & Wellness': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700',
  'Repairs & Maintenance': 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=700',
  'Moving Services': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=700',
  'Pet Care': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=700',
  'Learning & Tutoring': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700',
};

function ServiceCard({ service, onBook }: { service: Service; onBook: (service: Service) => void }) {
  const rating = service.reviews.length
    ? (service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length).toFixed(1)
    : 'New';
  return <article>
    <div className="image" style={{ backgroundImage: `url(${service.image})` }}><span>{service.category.name}</span></div>
    <div className="card-body">
      <div className="rating"><Star size={14} fill="currentColor" /> {rating} {service.reviews.length > 0 && <i>({service.reviews.length})</i>}</div>
      <h3>{service.title}</h3><p>{service.description}</p>
      <div className="meta"><span><Clock size={16} />{service.duration} min</span><strong>From ${Number(service.price).toFixed(0)}</strong></div>
      <button onClick={() => onBook(service)}>Book this service <ArrowRight size={17} /></button>
    </div>
  </article>;
}

function App() {
  const [featured, setFeatured] = useState<Service[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceMeta, setServiceMeta] = useState<PaginationMeta>({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [servicePage, setServicePage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('home');
  const [selected, setSelected] = useState<Service | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [bookingDate, setBookingDate] = useState<Date>();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    Promise.all([api<Service[]>('/services?page=1&limit=6'), api<Category[]>('/categories?page=1&limit=20')])
      .then(([serviceRows, categoryRows]) => { setFeatured(serviceRows); setCategories(categoryRows); })
      .catch(() => setToast({ type: 'error', message: 'Could not load services. Please try again.' }))
      .finally(() => setInitialLoading(false));
    if (localStorage.getItem('token')) api<User>('/users/me').then(setUser).catch(() => localStorage.removeItem('token'));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (view !== 'home') return;
    const timer = window.setInterval(() => setHeroSlide(slide => (slide + 1) % heroSlides.length), 4500);
    return () => window.clearInterval(timer);
  }, [view]);

  useEffect(() => {
    if (view !== 'services') return;
    const params = new URLSearchParams({ page: String(servicePage), limit: '6' });
    if (categoryId) params.set('categoryId', categoryId);
    if (searchTerm) params.set('search', searchTerm);
    setServicesLoading(true);
    apiPaginated<Service>(`/services?${params}`).then(({ data, meta }) => {
      setServices(data); setServiceMeta(meta); window.scrollTo({ top: 0, behavior: 'smooth' });
    }).catch(error => setToast({ type: 'error', message: (error as Error).message })).finally(() => setServicesLoading(false));
  }, [view, servicePage, categoryId, searchTerm]);

  useEffect(() => {
    if (view !== 'home') return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActiveSection(entry.target.id);
    }), { rootMargin: '-35% 0px -55%' });
    ['home', 'how', 'trust'].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [view]);

  const openServices = (nextCategory = '', nextSearch = '') => {
    setCategoryId(nextCategory); setSearchTerm(nextSearch); setServicePage(1); setView('services'); setMobileOpen(false);
  };
  const goHome = () => { setView('home'); setActiveSection('home'); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goTo = (id: string) => {
    setView('home'); setMobileOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })));
  };
  const chooseService = (service: Service) => { setSelected(service); setBookingDate(undefined); };
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); openServices('', String(form.get('search') || '').trim());
  };
  const auth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); setAuthError(''); setAuthLoading(true);
    try { const data = await api<{ token: string; user: User }>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) }); localStorage.setItem('token', data.token); setUser(data.user); setAuthOpen(false); setNotice(`Welcome${mode === 'register' ? ' to Servora' : ''}, ${data.user.name}.`); }
    catch (error) { setAuthError((error as Error).message); } finally { setAuthLoading(false); }
  };
  const book = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!user) { setSelected(null); setAuthOpen(true); return; }
    if (!bookingDate) { setToast({ type: 'error', message: 'Please choose a booking date and time.' }); return; }
    const form = new FormData(event.currentTarget);
    setBookingLoading(true);
    try { await api('/bookings', { method: 'POST', body: JSON.stringify({ serviceId: selected!.id, scheduledAt: bookingDate.toISOString(), address: form.get('address'), note: form.get('note') }) }); setSelected(null); setBookingDate(undefined); setToast({ type: 'success', message: 'Booking confirmed! You can view it in your dashboard.' }); }
    catch (error) { setToast({ type: 'error', message: (error as Error).message }); }
    finally { setBookingLoading(false); }
  };

  if (dashboardOpen && user) return <Dashboard user={user} onClose={() => setDashboardOpen(false)} />;

  return <>
    {(initialLoading || servicesLoading || bookingLoading) && <div className="toast toast-loading" role="status"><span className="toast-spinner" /><div><strong>{bookingLoading ? 'Confirming your booking' : 'Loading services'}</strong><small>Please wait a moment…</small></div></div>}
    {toast && <div className={`toast toast-${toast.type}`} role="status"><span className="toast-icon">{toast.type === 'success' ? <Check /> : <X />}</span><div><strong>{toast.type === 'success' ? 'Success' : 'Something went wrong'}</strong><small>{toast.message}</small></div><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16} /></button></div>}
    <header>
      <button className="brand brand-button" onClick={goHome}><span>S</span>servora</button>
      <nav>
        <button className={view === 'home' && activeSection === 'home' ? 'nav-active' : ''} onClick={goHome}>Home</button>
        <button className={view === 'services' ? 'nav-active' : ''} onClick={() => openServices()}>All Services</button>
        <button className={view === 'home' && activeSection === 'how' ? 'nav-active' : ''} onClick={() => goTo('how')}>How it works</button>
        <button className={view === 'home' && activeSection === 'trust' ? 'nav-active' : ''} onClick={() => goTo('trust')}>Why Servora</button>
      </nav>
      <div className="actions">
        {user ? <><span className="hello">Hi, {user.name.split(' ')[0]}</span><button className="link desktop-account" onClick={() => setDashboardOpen(true)}>Dashboard</button><button className="link desktop-account" onClick={() => { localStorage.removeItem('token'); setUser(null); }}>Log out</button></> : <button className="link desktop-account" onClick={() => setAuthOpen(true)}>Log in</button>}
        <button className="primary" onClick={() => openServices()}>Find a service</button>
        <button className="menu-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
    {mobileOpen && <><button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="mobile-drawer">
      <button className="mobile-drawer-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X /></button><small>NAVIGATION</small>
      <button className={view === 'home' && activeSection === 'home' ? 'active' : ''} onClick={goHome}>Home</button>
      <button className={view === 'services' ? 'active' : ''} onClick={() => openServices()}>All Services</button>
      <button className={view === 'home' && activeSection === 'how' ? 'active' : ''} onClick={() => goTo('how')}>How it works</button>
      <button className={view === 'home' && activeSection === 'trust' ? 'active' : ''} onClick={() => goTo('trust')}>Why Servora</button>
      <div className="mobile-account">{user ? <><span>Signed in as <strong>{user.name}</strong></span><button className="primary" onClick={() => { setDashboardOpen(true); setMobileOpen(false); }}>Open dashboard</button><button onClick={() => { localStorage.removeItem('token'); setUser(null); setMobileOpen(false); }}>Log out</button></> : <button className="primary" onClick={() => { setAuthOpen(true); setMobileOpen(false); }}>Log in</button>}</div>
    </aside></>}

    {view === 'home' ? <main>
      <section id="home" className="hero hero-split"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> Exceptional help, thoughtfully delivered</div><form className="search hero-search" onSubmit={submitSearch}><Search /><input name="search" placeholder="What can we help with?" /><button>Explore services <ArrowRight size={18} /></button></form><h1>More time for life.<br /><em>Help is here.</em></h1><p>Book trusted local professionals for your home, wellness, learning, pets and more—all in one beautiful, reassuring place.</p><div className="proof"><span><Check /> Vetted professionals</span><span><ShieldCheck /> Satisfaction guaranteed</span><span><Star /> Loved by 12,000+ homes</span></div></div><div className="hero-visual"><div className="hero-slides">{heroSlides.map((slide, index) => <img className={index === heroSlide ? 'active' : ''} key={slide.image} src={slide.image} alt={slide.alt} />)}</div><button className="slider-arrow slider-prev" aria-label="Previous hero image" onClick={() => setHeroSlide(slide => (slide - 1 + heroSlides.length) % heroSlides.length)}><ArrowLeft /></button><button className="slider-arrow slider-next" aria-label="Next hero image" onClick={() => setHeroSlide(slide => (slide + 1) % heroSlides.length)}><ArrowRight /></button><div className="slider-dots" aria-label="Hero slides">{heroSlides.map((_, index) => <button className={index === heroSlide ? 'active' : ''} aria-label={`Show slide ${index + 1}`} aria-current={index === heroSlide ? 'true' : undefined} key={index} onClick={() => setHeroSlide(index)} />)}</div><div className="hero-rating"><Star size={17} fill="currentColor" /><strong>4.9 average rating</strong><span>from happy homes</span></div><div className="hero-availability"><span><Check size={15} /></span><div><strong>Ready when you are</strong><small>Book in just a few minutes</small></div></div></div></section>
      <section className="categories"><div className="section-title"><div><small>EVERYDAY, ELEVATED</small><h2>What can we take care of?</h2></div><button className="link" onClick={() => openServices()}>View all services <ArrowRight size={16} /></button></div><div className="category-grid category-images">{categories.map(category => <button key={category.id} onClick={() => openServices(category.id)} style={{ backgroundImage: `linear-gradient(90deg,rgba(15,38,31,.78),rgba(15,38,31,.18)),url(${categoryImages[category.name]})` }}><span>{category.name}</span><ArrowRight /></button>)}</div></section>
      <section id="featured" className="services"><div className="section-title"><div><small>CURATED FOR YOU</small><h2>Services people love</h2></div><button className="browse-all-cta" onClick={() => openServices()}>Browse all services <ArrowRight size={18} /></button></div>{notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={16} /></button></div>}<div className="cards">{featured.map(service => <ServiceCard key={service.id} service={service} onBook={chooseService} />)}</div></section>
      <section id="how" className="steps"><small>EFFORTLESS BY DESIGN</small><h2>More ease. Less to-do.</h2><div><article><b>01</b><h3>Tell us what you need</h3><p>Choose a service and the time that works for your life.</p></article><article><b>02</b><h3>Meet your professional</h3><p>Every provider is carefully vetted, rated, and ready to help.</p></article><article><b>03</b><h3>Enjoy the difference</h3><p>Relax while it gets done—backed by our happiness promise.</p></article></div></section>
      <section id="trust" className="promise"><div><small>THE SERVORA PROMISE</small><h2>Care you can count on.</h2><p>We're building a better way to ask for help. Every detail—from who arrives at your door to how support responds—is designed around your peace of mind.</p><button className="primary">Our quality standard <ArrowRight size={17} /></button></div><blockquote>“The kind of service that makes you wonder how you ever managed without it.”<footer>— Maya T., Servora member</footer></blockquote></section>
    </main> : <main className="all-services-page">
      <section className="services-page-hero"><button className="back-link" onClick={goHome}><ArrowLeft size={17} /> Back home</button><small>TRUSTED LOCAL PROFESSIONALS</small><h1>All services</h1><p>Browse every service, filter by category, and book the right professional in a few simple steps.</p><form className="catalog-search" onSubmit={submitSearch}><Search size={19} /><input name="search" defaultValue={searchTerm} placeholder="Search services" /><button className="primary">Search</button></form></section>
      <section className="service-catalog"><div className="catalog-toolbar"><div className="category-filters"><button className={!categoryId ? 'active' : ''} onClick={() => { setCategoryId(''); setServicePage(1); }}>All</button>{categories.map(category => <button className={categoryId === category.id ? 'active' : ''} key={category.id} onClick={() => { setCategoryId(category.id); setServicePage(1); }}>{category.name}</button>)}</div><span>{serviceMeta.total} services</span></div>
        {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={16} /></button></div>}
        {servicesLoading ? <div className="catalog-state">Loading services…</div> : services.length ? <div className="cards">{services.map(service => <ServiceCard key={service.id} service={service} onBook={chooseService} />)}</div> : <div className="catalog-state"><h2>No services found</h2><p>Try another category or search term.</p></div>}
        {serviceMeta.totalPages > 1 && <nav className="pagination" aria-label="Service pages"><button disabled={servicePage === 1} onClick={() => setServicePage(page => page - 1)}><ArrowLeft size={16} /> Previous</button>{Array.from({ length: serviceMeta.totalPages }, (_, index) => index + 1).map(page => <button className={page === servicePage ? 'active' : ''} aria-current={page === servicePage ? 'page' : undefined} key={page} onClick={() => setServicePage(page)}>{page}</button>)}<button disabled={servicePage === serviceMeta.totalPages} onClick={() => setServicePage(page => page + 1)}>Next <ArrowRight size={16} /></button></nav>}
      </section>
    </main>}

    <footer className="footer"><button className="brand brand-button" onClick={goHome}><span>S</span>servora</button><p>More time for what matters.</p><small>© 2026 Servora. Thoughtful help, close to home.</small></footer>
    {authOpen && <div className="modal"><form onSubmit={auth}><button type="button" className="close" onClick={() => setAuthOpen(false)}><X /></button><small>WELCOME TO SERVORA</small><h2>{mode === 'login' ? 'Good to see you again.' : 'Create your account.'}</h2>{mode === 'register' && <label>Name<input name="name" required minLength={2} /></label>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" required minLength={8} /></label>{authError && <div className="form-error">{authError}</div>}<button className="primary" disabled={authLoading}>{authLoading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'} {!authLoading && <ArrowRight size={17} />}</button><p>{mode === 'login' ? 'New here? ' : 'Already a member? '}<button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setAuthError(''); }}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></p></form></div>}
    {selected && <div className="modal booking-modal"><form onSubmit={book}><button type="button" className="close" onClick={() => setSelected(null)}><X /></button><small>BOOK YOUR SERVICE</small><h2>{selected.title}</h2><div className="booking-price">${Number(selected.price).toFixed(0)} <span>· {selected.duration} minutes</span></div><DateTimePicker value={bookingDate} onChange={setBookingDate} /><label>Service address<input name="address" required minLength={5} /></label><label>Anything we should know?<textarea name="note" rows={3} /></label><button className="primary" disabled={!bookingDate || bookingLoading}><CalendarDays size={17} /> {bookingLoading ? 'Confirming…' : 'Confirm booking'}</button></form></div>}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
