export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
      {label && <p className="mt-3 text-sm text-slate-500">{label}</p>}
    </div>
  );
}
