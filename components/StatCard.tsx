export function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="shell-card p-4">
      <p className="text-xs font-bold text-muted">{label}</p>
      <strong className="mt-1 block text-3xl">{value}</strong>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}
