export const isoToday = () => new Date().toISOString().slice(0, 10);
export const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) => date ? new Intl.DateTimeFormat('en-US', options).format(new Date(`${date}T12:00:00`)) : 'No date';
export const dateTimeLabel = (date, time) => `${formatDate(date)}${time ? ` · ${time}` : ''}`;
export const isOverdue = (date, done = false) => Boolean(date && date < isoToday() && !done);
export const daysFromNow = (date) => Math.round((new Date(`${date}T12:00:00`) - new Date(`${isoToday()}T12:00:00`)) / 86400000);
