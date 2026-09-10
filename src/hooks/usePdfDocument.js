import { useEffect, useState } from 'react';
import { getPdfFile } from '../utils/pdfStorage';

export default function usePdfDocument(pdfId) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(Boolean(pdfId));
  useEffect(() => { let active = true; let objectUrl = ''; if (!pdfId) { setUrl(''); setLoading(false); return undefined; } setLoading(true); getPdfFile(pdfId).then(blob => { if (!active || !blob) return; objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); setLoading(false); }).catch(() => { if (active) setLoading(false); }); return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [pdfId]);
  return { url, loading };
}
