import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarDays, LayoutDashboard, Plus, Star, Trash2 } from 'lucide-react';
import { api, type Category, type Service } from './api';
import './dashboard.css';

type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type DashboardUser = { id: string; name: string; email: string; role: Role };
type Booking = { id: string; scheduledAt: string; address: string; note?: string; total: string; status: 'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED'; customer?: {name:string;email:string}; service: Service };
type ManagedUser = DashboardUser & { createdAt: string };

export default function Dashboard({ user, onClose }: { user: DashboardUser; onClose: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const common = api<Category[]>('/categories');
      if (user.role === 'CUSTOMER') {
        const [bookingData, categoryData] = await Promise.all([api<Booking[]>('/bookings'), common]);
        setBookings(bookingData); setCategories(categoryData);
      } else {
        const tasks: Promise<unknown>[] = [api<Service[]>('/services/mine'), api<Booking[]>('/bookings/provider'), common];
        if (user.role === 'ADMIN') tasks.push(api<ManagedUser[]>('/users'));
        const [serviceData, bookingData, categoryData, userData] = await Promise.all(tasks);
        setServices(serviceData as Service[]); setBookings(bookingData as Booking[]); setCategories(categoryData as Category[]);
        if (userData) setUsers(userData as ManagedUser[]);
      }
    } catch (reason) { setError((reason as Error).message); }
  }, [user.role]);

  useEffect(() => { void load(); }, [load]);
  const done = async (action: () => Promise<unknown>, success: string) => { setError(''); try { await action(); setMessage(success); await load(); } catch (reason) { setError((reason as Error).message); } };

  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const body = Object.fromEntries(form);
    void done(() => api(editing ? `/services/${editing.id}` : '/services', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(body) }), editing ? 'Service updated.' : 'Service created.');
    setEditing(null); event.currentTarget.reset();
  };
  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get('name'));
    void done(() => api('/categories', { method: 'POST', body: JSON.stringify({ name, slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'), description: form.get('description') || undefined, icon: '✦' }) }), 'Category created.');
    event.currentTarget.reset();
  };
  const addReview = (event: FormEvent<HTMLFormElement>, serviceId: string) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void done(() => api('/reviews', { method: 'POST', body: JSON.stringify({ serviceId, rating: Number(form.get('rating')), comment: form.get('comment') }) }), 'Review published.');
    event.currentTarget.reset();
  };

  return <div className="dashboard-page">
    <header className="dash-header"><button onClick={onClose}><ArrowLeft size={18}/> Back to Servora</button><div className="dash-current"><LayoutDashboard size={19}/><strong>{user.role === 'CUSTOMER' ? 'My dashboard' : user.role === 'PROVIDER' ? 'Provider studio' : 'Admin console'}</strong></div><span>{user.name}</span></header>
    <main className="dash-main">
      <section className="dash-welcome"><small>{user.role} WORKSPACE</small><h1>Welcome back, {user.name.split(' ')[0]}.</h1><p>Everything you need to manage your Servora experience in one place.</p></section>
      {message && <div className="dash-alert success">{message}<button onClick={()=>setMessage('')}>×</button></div>}
      {error && <div className="dash-alert error">{error}<button onClick={()=>setError('')}>×</button></div>}

      {user.role === 'CUSTOMER' ? <section className="dash-section"><div className="dash-title"><div><small>YOUR SCHEDULE</small><h2>My bookings</h2></div><span>{bookings.length} total</span></div>
        <div className="booking-list">{bookings.length === 0 && <div className="dash-empty">No bookings yet. Return to the marketplace and book your first service.</div>}{bookings.map(booking=><article className="booking-row" key={booking.id}><img className="booking-thumb" src={booking.service.image} alt={booking.service.title}/><div className="booking-date"><CalendarDays/><b>{new Date(booking.scheduledAt).toLocaleDateString()}</b><span>{new Date(booking.scheduledAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div><div><small>{booking.service.category.name}</small><h3>{booking.service.title}</h3><p>{booking.address}</p></div><div className="booking-actions"><span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span><strong>${Number(booking.total).toFixed(0)}</strong>{!['COMPLETED','CANCELLED'].includes(booking.status)&&<button className="danger" onClick={()=>void done(()=>api(`/bookings/${booking.id}`,{method:'PATCH',body:JSON.stringify({status:'CANCELLED'})}),'Booking cancelled.')}>Cancel</button>}</div>{booking.status==='COMPLETED'&&<form className="review-form" onSubmit={e=>addReview(e,booking.service.id)}><select name="rating" defaultValue="5"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input name="comment" placeholder="Share your experience" required/><button><Star size={15}/> Review</button></form>}</article>)}</div>
      </section> : <>
        <section className="dash-grid"><div className="dash-section"><div className="dash-title"><div><small>SERVICE CATALOG</small><h2>{editing ? 'Edit service' : 'Add a service'}</h2></div>{editing&&<button onClick={()=>setEditing(null)}>Cancel edit</button>}</div><form className="manage-form" key={editing?.id||'new'} onSubmit={saveService}><label>Title<input name="title" required defaultValue={editing?.title}/></label><label>Category<select name="categoryId" required defaultValue={editing?.category.id}><option value="">Select category</option>{categories.map(category=><option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label className="wide">Description<textarea name="description" required rows={3} defaultValue={editing?.description}/></label><label>Price ($)<input name="price" type="number" min="1" required defaultValue={editing?.price}/></label><label>Duration (minutes)<input name="duration" type="number" min="15" required defaultValue={editing?.duration}/></label><label>Status<select name="status" defaultValue={(editing as Service & {status?:string})?.status||'ACTIVE'}><option>ACTIVE</option><option>DRAFT</option><option>PAUSED</option></select></label><label>Image URL<input name="image" type="url" defaultValue={editing?.image}/></label><button className="wide primary"><Plus size={16}/>{editing?'Save changes':'Create service'}</button></form></div>
        {user.role==='ADMIN'&&<div className="dash-section"><div className="dash-title"><div><small>TAXONOMY</small><h2>Categories</h2></div><span>{categories.length} total</span></div><form className="category-form" onSubmit={addCategory}><input name="name" placeholder="New category name" required/><input name="description" placeholder="Short description"/><button><Plus size={16}/> Add</button></form><div className="mini-list">{categories.map(category=><div key={category.id}><span>{category.icon} {category.name}</span><button className="icon-danger" onClick={()=>void done(()=>api(`/categories/${category.id}`,{method:'DELETE'}),'Category removed.')}><Trash2 size={15}/></button></div>)}</div></div>}
        </section>
        <section className="dash-section"><div className="dash-title"><div><small>YOUR OFFERINGS</small><h2>Manage services</h2></div><span>{services.length} total</span></div><div className="service-table">{services.map(service=><div key={service.id}><img src={service.image}/><div><small>{service.category.name}</small><h3>{service.title}</h3></div><strong>${Number(service.price).toFixed(0)}</strong><span>{(service as Service & {status?:string}).status}</span><button onClick={()=>setEditing(service)}>Edit</button><button className="icon-danger" onClick={()=>void done(()=>api(`/services/${service.id}`,{method:'DELETE'}),'Service deleted.')}><Trash2 size={16}/></button></div>)}</div></section>
        <section className="dash-section"><div className="dash-title"><div><small>OPERATIONS</small><h2>Incoming bookings</h2></div><span>{bookings.length} total</span></div><div className="booking-list">{bookings.map(booking=><article className="booking-row compact" key={booking.id}><div><small>{booking.customer?.name} · {booking.customer?.email}</small><h3>{booking.service.title}</h3><p>{new Date(booking.scheduledAt).toLocaleString()} · {booking.address}</p></div><select value={booking.status} onChange={event=>void done(()=>api(`/bookings/${booking.id}`,{method:'PATCH',body:JSON.stringify({status:event.target.value})}),'Booking status updated.')}><option>PENDING</option><option>CONFIRMED</option><option>COMPLETED</option><option>CANCELLED</option></select></article>)}</div></section>
        {user.role==='ADMIN'&&<section className="dash-section"><div className="dash-title"><div><small>COMMUNITY</small><h2>Users</h2></div><span>{users.length} active</span></div><div className="user-grid">{users.map(item=><article key={item.id}><b>{item.name.charAt(0)}</b><div><h3>{item.name}</h3><p>{item.email}</p></div><span>{item.role}</span></article>)}</div></section>}
      </>}
    </main>
  </div>;
}
