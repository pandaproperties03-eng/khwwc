// Currency formatting - KES
export function formatKes(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export function formatKesShort(amount: number): string {
  if (amount >= 1000000) return `KSh ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `KSh ${(amount / 1000).toFixed(1)}K`;
  return `KSh ${amount}`;
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Phone validation (Kenyan format)
export function validateKenyanPhone(phone: string): { valid: boolean; normalized?: string } {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Kenyan phone formats: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
  if (/^07\d{8}$/.test(cleaned) || /^01\d{8}$/.test(cleaned)) {
    return { valid: true, normalized: cleaned };
  }
  if (/^\+254[17]\d{8}$/.test(cleaned)) {
    return { valid: true, normalized: '0' + cleaned.slice(4) };
  }
  if (/^254[17]\d{8}$/.test(cleaned)) {
    return { valid: true, normalized: '0' + cleaned.slice(3) };
  }
  return { valid: false };
}

// Greeting based on time
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 16) return 'Good afternoon';
  if (hour < 20) return 'Good evening';
  return 'Good night';
}

// Generate simple ID
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
