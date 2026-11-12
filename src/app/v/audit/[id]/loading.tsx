export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading verification result">
      <div className="skeleton h-4 w-40" />
      <div className="card flex items-center gap-5 p-8">
        <div className="skeleton size-16 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-3 w-full max-w-md" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="card space-y-4 p-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-9" />
          ))}
        </div>
        <div className="card space-y-4 p-6">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
        </div>
      </div>
    </div>
  );
}
