import { DayPicker } from '@daypicker/react';
import '@daypicker/react/style.css';
import './date-time-picker.css';

type Props = { value?: Date; onChange: (value?: Date) => void };
const slots = Array.from({ length: 25 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

export default function DateTimePicker({ value, onChange }: Props) {
  const selectedTime = value ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}` : '10:00';
  const setDate = (date?: Date) => {
    if (!date) return onChange(undefined);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(new Date(date));
  };
  const setTime = (time: string) => {
    const date = value ? new Date(value) : new Date(Date.now() + 86400000);
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(date);
  };

  const endMonth = new Date(); endMonth.setMonth(endMonth.getMonth() + 6);
  return <div className="date-time-picker">
    <DayPicker animate mode="single" required selected={value} onSelect={setDate} disabled={{ before: new Date() }} startMonth={new Date()} endMonth={endMonth}/>
    <div className="time-choice"><label htmlFor="booking-time">Preferred time</label><select id="booking-time" value={selectedTime} onChange={event => setTime(event.target.value)}>{slots.map(slot => <option value={slot} key={slot}>{new Date(`2000-01-01T${slot}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</option>)}</select></div>
    <p>{value ? <>Selected <strong>{value.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></> : 'Choose a day to continue'}</p>
  </div>;
}
