const DB_NAME = 'clines-life-dashboard-documents';
const STORE_NAME = 'pdf-files';

const openDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const savePdfFile = async (noteId, file) => {
  const id = `pdf-${noteId}-${Date.now()}`;
  const metadata = { id, filename: file.name, fileSize: file.size, mimeType: 'application/pdf', noteId, createdAt: new Date().toISOString() };
  const db = await openDatabase();
  await new Promise((resolve, reject) => { const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put({ ...metadata, blob: file }); request.onsuccess = resolve; request.onerror = () => reject(request.error); });
  db.close();
  return metadata;
};

export const getPdfFile = async id => { const db = await openDatabase(); const file = await new Promise((resolve, reject) => { const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); db.close(); return file?.blob || null; };
export const deletePdfFile = async id => { if (!id) return; const db = await openDatabase(); await new Promise((resolve, reject) => { const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id); request.onsuccess = resolve; request.onerror = () => reject(request.error); }); db.close(); };
export const clearPdfFiles = async () => { const db = await openDatabase(); await new Promise((resolve, reject) => { const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).clear(); request.onsuccess = resolve; request.onerror = () => reject(request.error); }); db.close(); };
export const downloadPdf = async metadata => { const blob = await getPdfFile(metadata.id); if (!blob) return; const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = metadata.filename; link.click(); URL.revokeObjectURL(url); };
