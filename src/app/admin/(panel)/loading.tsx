export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton h-9 w-48" />
      <div className="skeleton mt-3 h-4 w-32" />
      <div className="skeleton mt-6 h-11 w-full sm:max-w-md" />
      <div className="card mt-5 divide-y divide-line-soft">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-56 max-w-full" />
              <div className="skeleton h-3 w-32" />
            </div>
            <div className="skeleton hidden h-4 w-40 md:block" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
