function EmptyState({
  title = "No data found",
  message = "There is nothing to show right now."
}) {

  return (
    <div className="p-10 text-center text-slate-500">
      <p className="font-bold text-slate-700">
        {title}
      </p>
      <p className="mt-1 text-sm">
        {message}
      </p>
    </div>
  );

}

export default EmptyState;
