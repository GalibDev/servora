import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarDays, Edit3, LayoutDashboard, Plus, Save, Star, Trash2, UserCircle } from 'lucide-react';
import { api, type Category, type Service } from './api';
import './dashboard.css';

type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type DashboardUser = { id: string; name: string; email: string; role: Role; avatar?: string; status?: 'ACTIVE' | 'SUSPENDED' };
type Booking = { id: string; scheduledAt: string; address: string; note?: string; total: string; status: 'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED'; customer?: {name:string;email:string}; service: Service };
type ManagedUser = DashboardUser & { createdAt: string; status: 'ACTIVE' | 'SUSPENDED' };
type ManagedCategory = Category & { slug?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' };
type ManagedService = Service & { status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' };
type Review = { id: string; rating: number; comment?: string; service: { id: string; title: string; image?: string } };

export default function Dashboard({ user, onClose, onUserChange }: { user: DashboardUser; onClose: () => void; onUserChange: (user: DashboardUser | null) => void }) {
  const [profile, setProfile] = useState(user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ManagedService[]>([]);
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingService, setEditingService] = useState<ManagedService | null>(null);
  const [editingCategory, setEditingCategory] = useState<ManagedCategory | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const common = api<ManagedCategory[]>(user.role === 'ADMIN' ? '/categories/manage?page=1&limit=100' : '/categories?page=1&limit=100');
      if (user.role === 'CUSTOMER') {
        const [bookingData, categoryData, reviewData] = await Promise.all([api<Booking[]>('/bookings?page=1&limit=100'), common, api<Review[]>('/reviews/mine?page=1&limit=100')]);
        setBookings(bookingData); setCategories(categoryData); setReviews(reviewData);
      } else {
        const tasks: Promise<unknown>[] = [api<ManagedService[]>('/services/mine?page=1&limit=100'), api<Booking[]>('/bookings/provider?page=1&limit=100'), common];
        if (user.role === 'ADMIN') tasks.push(api<ManagedUser[]>('/users?page=1&limit=100'));
        const [serviceData, bookingData, categoryData, userData] = await Promise.all(tasks);
        setServices(serviceData as ManagedService[]); setBookings(bookingData as Booking[]); setCategories(categoryData as ManagedCategory[]);
        if (userData) setUsers(userData as ManagedUser[]);
      }
    } catch (reason) { setError((reason as Error).message); }
  }, [user.role]);

  useEffect(() => { void load(); }, [load]);
  const done = async (action: () => Promise<unknown>, success: string) => { setError(''); try { await action(); setMessage(success); await load(); } catch (reason) { setError((reason as Error).message); } };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget));
    try { const updated = await api<DashboardUser>(`/users/${user.id}`, { method: 'PATCH', body: JSON.stringify(body) }); setProfile(updated); onUserChange(updated); setMessage('Profile updated.'); }
    catch (reason) { setError((reason as Error).message); }
  };
  const deleteProfile = async () => {
    if (!window.confirm('Delete your account? This action will deactivate your account.')) return;
    try { await api(`/users/${user.id}`, { method: 'DELETE' }); localStorage.removeItem('token'); onUserChange(null); onClose(); }
    catch (reason) { setError((reason as Error).message); }
  };
  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget));
    void done(() => api(editingService ? `/services/${editingService.id}` : '/services', { method: editingService ? 'PATCH' : 'POST', body: JSON.stringify(body) }), editingService ? 'Service updated.' : 'Service created.');
    setEditingService(null); event.currentTarget.reset();
  };
  const saveCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get('name'));
    const body = { name, description: form.get('description') || undefined, status: form.get('status') || 'ACTIVE', ...(editingCategory ? {} : { slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'), icon: '✦' }) };
    void done(() => api(editingCategory ? `/categories/${editingCategory.id}` : '/categories', { method: editingCategory ? 'PATCH' : 'POST', body: JSON.stringify(body) }), editingCategory ? 'Category updated.' : 'Category created.');
    setEditingCategory(null); event.currentTarget.reset();
  };
  const addReview = (event: FormEvent<HTMLFormElement>, serviceId: string) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void done(() => api('/reviews', { method: 'POST', body: JSON.stringify({ serviceId, rating: Number(form.get('rating')), comment: form.get('comment') }) }), 'Review published.');
    event.currentTarget.reset();
  };
  const updateReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editingReview) return; const form = new FormData(event.currentTarget);
    void done(() => api(`/reviews/${editingReview.id}`, { method: 'PATCH', body: JSON.stringify({ rating: Number(form.get('rating')), comment: form.get('comment') }) }), 'Review updated.');
    setEditingReview(null);
  };

  return <div className="dashboard-page">
    <header className="dash-header"><button onClick={onClose}><ArrowLeft size={18}/> Back to Servora</button><div className="dash-current"><LayoutDashboard size={19}/><strong>{user.role === 'CUSTOMER' ? 'My dashboard' : user.role === 'PROVIDER' ? 'Provider studio' : 'Admin console'}</strong></div><span>{profile.name}</span></header>
    <main className="dash-main">
      <section className="dash-welcome"><small>{user.role} WORKSPACE</small><h1>Welcome back, {profile.name.split(' ')[0]}.</h1><p>Everything you need to manage your Servora experience in one place.</p></section>
      {message && <div className="dash-alert success">{message}<button onClick={()=>setMessage('')}>×</button></div>}
      {error && <div className="dash-alert error">{error}<button onClick={()=>setError('')}>×</button></div>}

      <section className="dash-section profile-section"><div className="dash-title"><div><small>ACCOUNT</small><h2>Profile settings</h2></div><UserCircle/></div><form className="profile-form" onSubmit={saveProfile}><label>Name<input name="name" required minLength={2} defaultValue={profile.name}/></label><label>Avatar URL<input name="avatar" type="url" defaultValue={profile.avatar||''} placeholder="https://…"/></label><button className="primary"><Save size={16}/> Save profile</button><button type="button" className="danger delete-account" onClick={()=>void deleteProfile()}><Trash2 size={16}/> Delete account</button></form></section>

      {user.role === 'CUSTOMER' ? <>
        <section className="dash-section"><div className="dash-title"><div><small>YOUR SCHEDULE</small><h2>My bookings</h2></div><span>{bookings.length} total</span></div>
          <div className="booking-list">{bookings.length === 0 && <div className="dash-empty">No bookings yet. Return to the marketplace and book your first service.</div>}{bookings.map(booking=>{const existingReview=reviews.find(review=>review.service.id===booking.service.id);return <article className="booking-row" key={booking.id}><img className="booking-thumb" src={booking.service.image} alt={booking.service.title}/><div className="booking-date"><CalendarDays/><b>{new Date(booking.scheduledAt).toLocaleDateString()}</b><span>{new Date(booking.scheduledAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div><div><small>{booking.service.category.name}</small><h3>{booking.service.title}</h3><p>{booking.address}</p></div><div className="booking-actions"><span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span><strong>${Number(booking.total).toFixed(0)}</strong>{!['COMPLETED','CANCELLED'].includes(booking.status)&&<button className="danger" onClick={()=>void done(()=>api(`/bookings/${booking.id}`,{method:'PATCH',body:JSON.stringify({status:'CANCELLED'})}),'Booking cancelled.')}>Cancel</button>}</div>{booking.status==='COMPLETED'&&!existingReview&&<form className="review-form" onSubmit={event=>addReview(event,booking.service.id)}><select name="rating" defaultValue="5"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input name="comment" placeholder="Share your experience" required/><button><Star size={15}/> Review</button></form>}{existingReview&&<button className="reviewed-link" onClick={()=>setEditingReview(existingReview)}><Star size={14}/> Edit your review</button>}</article>})}</div>
        </section>
        <section className="dash-section"><div className="dash-title"><div><small>YOUR FEEDBACK</small><h2>My reviews</h2></div><span>{reviews.length} total</span></div>{editingReview&&<form className="review-editor" key={editingReview.id} onSubmit={updateReview}><strong>{editingReview.service.title}</strong><select name="rating" defaultValue={editingReview.rating}>{[5,4,3,2,1].map(rating=><option value={rating} key={rating}>{rating} stars</option>)}</select><input name="comment" required defaultValue={editingReview.comment}/><button><Save size={15}/> Save</button><button type="button" onClick={()=>setEditingReview(null)}>Cancel</button></form>}<div className="review-list">{reviews.map(review=><article key={review.id}><img src={review.service.image} alt=""/><div><strong>{review.service.title}</strong><span>{'★'.repeat(review.rating)}</span><p>{review.comment}</p></div><button onClick={()=>setEditingReview(review)}><Edit3 size={15}/></button><button className="icon-danger" onClick={()=>void done(()=>api(`/reviews/${review.id}`,{method:'DELETE'}),'Review deleted.')}><Trash2 size={15}/></button></article>)}</div></section>
      </> : <>
        <section className="dash-grid"><div className="dash-section"><div className="dash-title"><div><small>SERVICE CATALOG</small><h2>{editingService ? 'Edit service' : 'Add a service'}</h2></div>{editingService&&<button onClick={()=>setEditingService(null)}>Cancel edit</button>}</div><form className="manage-form" key={editingService?.id||'new'} onSubmit={saveService}><label>Title<input name="title" required defaultValue={editingService?.title}/></label><label>Category<select name="categoryId" required defaultValue={editingService?.category.id}><option value="">Select category</option>{categories.map(category=><option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label className="wide">Description<textarea name="description" required rows={3} defaultValue={editingService?.description}/></label><label>Price ($)<input name="price" type="number" min="1" required defaultValue={editingService?.price}/></label><label>Duration (minutes)<input name="duration" type="number" min="15" required defaultValue={editingService?.duration}/></label><label>Status<select name="status" defaultValue={editingService?.status||'ACTIVE'}><option>ACTIVE</option><option>DRAFT</option><option>PAUSED</option></select></label><label>Image URL<input name="image" type="url" defaultValue={editingService?.image}/></label><button className="wide primary"><Plus size={16}/>{editingService?'Save changes':'Create service'}</button></form></div>
          {user.role==='ADMIN'&&<div className="dash-section"><div className="dash-title"><div><small>TAXONOMY</small><h2>{editingCategory?'Edit category':'Categories'}</h2></div>{editingCategory?<button onClick={()=>setEditingCategory(null)}>Cancel</button>:<span>{categories.length} total</span>}</div><form className="category-form" key={editingCategory?.id||'new'} onSubmit={saveCategory}><input name="name" placeholder="Category name" required defaultValue={editingCategory?.name}/><input name="description" placeholder="Short description" defaultValue={editingCategory?.description}/><select name="status" defaultValue={editingCategory?.status||'ACTIVE'}><option>ACTIVE</option><option>INACTIVE</option></select><button><Plus size={16}/> {editingCategory?'Save':'Add'}</button></form><div className="mini-list">{categories.map(category=><div key={category.id}><span>{category.icon} {category.name}</span><div><button onClick={()=>setEditingCategory(category)}><Edit3 size={15}/></button><button className="icon-danger" onClick={()=>void done(()=>api(`/categories/${category.id}`,{method:'DELETE'}),'Category removed.')}><Trash2 size={15}/></button></div></div>)}</div></div>}
        </section>
        <section className="dash-section"><div className="dash-title"><div><small>YOUR OFFERINGS</small><h2>Manage services</h2></div><span>{services.length} total</span></div><div className="service-table">{services.map(service=><div key={service.id}><img src={service.image}/><div><small>{service.category.name}</small><h3>{service.title}</h3></div><strong>${Number(service.price).toFixed(0)}</strong><span>{service.status}</span><button onClick={()=>setEditingService(service)}>Edit</button><button className="icon-danger" onClick={()=>void done(()=>api(`/services/${service.id}`,{method:'DELETE'}),'Service deleted.')}><Trash2 size={16}/></button></div>)}</div></section>
        <section className="dash-section"><div className="dash-title"><div><small>OPERATIONS</small><h2>Incoming bookings</h2></div><span>{bookings.length} total</span></div><div className="booking-list">{bookings.map(booking=><article className="booking-row compact" key={booking.id}><div><small>{booking.customer?.name} · {booking.customer?.email}</small><h3>{booking.service.title}</h3><p>{new Date(booking.scheduledAt).toLocaleString()} · {booking.address}</p></div><select value={booking.status} onChange={event=>void done(()=>api(`/bookings/${booking.id}`,{method:'PATCH',body:JSON.stringify({status:event.target.value})}),'Booking status updated.')}><option>PENDING</option><option>CONFIRMED</option><option>COMPLETED</option><option>CANCELLED</option></select></article>)}</div></section>
        {user.role==='ADMIN'&&<section className="dash-section"><div className="dash-title"><div><small>COMMUNITY</small><h2>Users</h2></div><span>{users.length} active</span></div><div className="user-grid">{users.map(item=><article key={item.id}><b>{item.name.charAt(0)}</b><div><h3>{item.name}</h3><p>{item.email}</p></div><span>{item.role}</span><select value={item.status} disabled={item.id===user.id} onChange={event=>void done(()=>api(`/users/${item.id}`,{method:'PATCH',body:JSON.stringify({status:event.target.value})}),'User status updated.')}><option>ACTIVE</option><option>SUSPENDED</option></select>{item.id!==user.id&&<button className="icon-danger" onClick={()=>window.confirm(`Deactivate ${item.name}?`)&&void done(()=>api(`/users/${item.id}`,{method:'DELETE'}),'User deactivated.')}><Trash2 size={15}/></button>}</article>)}</div></section>}
      </>}
    </main>
  </div>;
}
