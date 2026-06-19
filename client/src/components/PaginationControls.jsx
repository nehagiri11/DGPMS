function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
}) {
  const totalPages =
    Math.max(
      Math.ceil(totalItems / pageSize),
      1
    );

  const start =
    totalItems === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const end =
    Math.min(
      page * pageSize,
      totalItems
    );

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t bg-white">
      <p className="text-sm text-slate-500">
        Showing {start} to {end} of {totalItems}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm font-semibold text-slate-700">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
