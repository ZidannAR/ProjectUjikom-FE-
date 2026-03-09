export default function SkeletonCard({ height = 80, lines = 3 }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 12, width: i === lines - 1 ? '60%' : '100%' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
