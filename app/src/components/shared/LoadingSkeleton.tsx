'use client';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
}

export function Skeleton({ className = '', height = 20, width = '100%', borderRadius = '8px' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, borderRadius }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card-skeleton card">
      <Skeleton height={12} width="60%" borderRadius="4px" />
      <Skeleton height={32} width="80%" borderRadius="6px" />
      <Skeleton height={10} width="40%" borderRadius="4px" />
      <style jsx>{`
        .stat-card-skeleton {
          padding: 20px; display: flex; flex-direction: column; gap: 10px;
        }
      `}</style>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="table-row-skeleton">
          <Skeleton height={14} width="12%" borderRadius="4px" />
          <Skeleton height={14} width="10%" borderRadius="4px" />
          <Skeleton height={14} width="8%" borderRadius="4px" />
          <Skeleton height={14} width="10%" borderRadius="4px" />
          <Skeleton height={14} width="8%" borderRadius="4px" />
          <Skeleton height={14} width="10%" borderRadius="4px" />
        </div>
      ))}
      <style jsx>{`
        .table-skeleton { display: flex; flex-direction: column; gap: 0; }
        .table-row-skeleton {
          display: flex; align-items: center; gap: 24px;
          padding: 14px 16px; border-bottom: 1px solid var(--color-border-subtle);
        }
        .table-row-skeleton > :global(*) { flex: 1; }
      `}</style>
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return <Skeleton height={height} width="100%" borderRadius="12px" />;
}
