import { useState, useEffect, useCallback } from 'react';

export function useRouter() {
  const [route, setRoute] = useState<string>(() => {
    return window.location.hash.slice(1) || '/';
  });

  useEffect(() => {
    const handler = () => {
      setRoute(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}
