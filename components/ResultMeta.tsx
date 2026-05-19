export function ResultMeta({
  shownCount,
  totalCount,
  updatedLabel,
  loading = false,
}: {
  shownCount: number;
  totalCount: number;
  updatedLabel: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>
        {loading ? (
          <span>Loading products…</span>
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-xyris-charcoal tabular">
              {shownCount.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-xyris-charcoal tabular">
              {totalCount.toLocaleString()}
            </span>
          </>
        )}
      </span>
      <span>Updated {updatedLabel}</span>
    </div>
  );
}
