export const canvas = typeof document !== 'undefined' ? document.getElementById('drawing') : null;
export const ctx = canvas ? canvas.getContext('2d') : null;
