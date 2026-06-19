function LoadingState({
  message = "Loading..."
}) {

  return (
    <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
      <div className="mx-auto mb-4 h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      <p className="font-medium">
        {message}
      </p>
    </div>
  );

}

export default LoadingState;
