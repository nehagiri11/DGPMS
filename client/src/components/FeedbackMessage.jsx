function FeedbackMessage({
  type = "info",
  message
}) {

  if (!message) {
    return null;
  }

  const styles = {
    success:
      "bg-green-50 border-green-500 text-green-700",
    error:
      "bg-red-50 border-red-500 text-red-700",
    info:
      "bg-blue-50 border-blue-500 text-blue-700",
  };

  return (
    <div
      className={`
        mb-5
        border-l-4
        rounded-lg
        px-4
        py-3
        font-medium
        whitespace-pre-line
        ${styles[type] || styles.info}
      `}
    >
      {message}
    </div>
  );

}

export default FeedbackMessage;
