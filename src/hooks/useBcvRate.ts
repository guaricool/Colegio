import { useState, useEffect, useCallback } from 'react';

export function useBcvRate() {
  const [bcvRate, setBcvRate] = useState<number>(755.15);
  const [loading, setLoading] = useState<boolean>(true);
  const [source, setSource] = useState<string>('');

  const fetchBcvRate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bcv');
      const data = await res.json();
      if (data.rate) {
        setBcvRate(data.rate);
        setSource(data.source || '');
      }
    } catch (e) {
      console.error('Error fetching BCV rate:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAutoBcvRate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bcv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto: true }),
      });
      const data = await res.json();
      if (data.rate) {
        setBcvRate(data.rate);
        setSource(data.source || '');
        return data.rate;
      }
    } catch (e) {
      console.error('Error syncing auto BCV rate:', e);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchBcvRate();
  }, [fetchBcvRate]);

  return { bcvRate, loading, source, fetchBcvRate, syncAutoBcvRate };
}
