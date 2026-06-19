import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

const ToastContext =
  createContext(null);

const getToastType = (message) => {

  const text =
    String(message || "")
      .toLowerCase();

  if (
    text.includes("fail") ||
    text.includes("error") ||
    text.includes("invalid") ||
    text.includes("denied") ||
    text.includes("expired") ||
    text.includes("not found") ||
    text.includes("required")
  ) {
    return "error";
  }

  if (
    text.includes("success") ||
    text.includes("created") ||
    text.includes("submitted") ||
    text.includes("approved") ||
    text.includes("recorded")
  ) {
    return "success";
  }

  return "info";

};

function ToastProvider({
  children
}) {

  const [toasts, setToasts] =
    useState([]);

  const showToast =
    useCallback(
      (
        message,
        type
      ) => {

        const id =
          Date.now() +
          Math.random();

        const toast = {
          id,
          message:
            String(message || ""),
          type:
            type ||
            getToastType(message)
        };

        setToasts((current) => [
          ...current,
          toast
        ]);

        window.setTimeout(
          () => {
            setToasts((current) =>
              current.filter(
                (item) =>
                  item.id !== id
              )
            );
          },
          3800
        );

      },
      []
    );

  useEffect(() => {

    const originalAlert =
      window.alert;

    window.alert = (message) => {
      showToast(message);
    };

    return () => {
      window.alert =
        originalAlert;
    };

  }, [showToast]);

  const styles = {
    success:
      "border-green-500 bg-green-50 text-green-800",
    error:
      "border-red-500 bg-red-50 text-red-800",
    info:
      "border-blue-500 bg-blue-50 text-blue-800",
  };

  return (
    <ToastContext.Provider
      value={showToast}
    >
      {children}

      <div className="
        fixed
        right-4
        top-4
        z-50
        w-[min(420px,calc(100vw-2rem))]
        space-y-3
      ">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              rounded-lg
              border-l-4
              px-4
              py-3
              shadow-lg
              whitespace-pre-line
              ${styles[toast.type] ||
                styles.info}
            `}
          >
            <div className="font-semibold">
              {toast.type === "success"
                ? "Success"
                : toast.type === "error"
                ? "Error"
                : "Notice"}
            </div>
            <div className="text-sm mt-1">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );

}

export const useToast = () =>
  useContext(ToastContext);

export default ToastProvider;
