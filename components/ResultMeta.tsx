export function ResultMeta({
  shownCount,
  updatedLabel,
  loading = false,
}: {
  shownCount: number;
  updatedLabel: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-slate-600">
      <span>
        {loading ? (
          <span>Loading prices…</span>
        ) : (
          <>
            <span className="font-bold text-xyris-charcoal tabular">
              {shownCount.toLocaleString()}
            </span>{" "}
            {shownCount === 1 ? "item" : "items"}
          </>
        )}
      </span>
      <span>Prices updated {updatedLabel}</span>
    </div>
  );
}
