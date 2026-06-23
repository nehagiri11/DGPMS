import { useMemo, useState } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiInbox,
  FiSearch,
  FiXCircle
} from "react-icons/fi";

const typeMeta = {
  PASS_APPROVED: {
    label: "Approved",
    icon: FiCheckCircle,
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    accent: "border-l-emerald-500",
    iconBox: "bg-emerald-50 text-emerald-700"
  },
  PASS_REJECTED: {
    label: "Rejected",
    icon: FiXCircle,
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    accent: "border-l-rose-500",
    iconBox: "bg-rose-50 text-rose-700"
  },
  PASS_CREATED: {
    label: "Pending Review",
    icon: FiClock,
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    accent: "border-l-blue-500",
    iconBox: "bg-blue-50 text-blue-700"
  },
  DEFAULT: {
    label: "Notification",
    icon: FiBell,
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    accent: "border-l-slate-400",
    iconBox: "bg-slate-100 text-slate-700"
  }
};

const filters = [
  {
    label: "All",
    value: "ALL"
  },
  {
    label: "Unread",
    value: "UNREAD"
  },
  {
    label: "Approved",
    value: "PASS_APPROVED"
  },
  {
    label: "Rejected",
    value: "PASS_REJECTED"
  },
  {
    label: "Pending",
    value: "PASS_CREATED"
  }
];

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

function NotificationCenter({
  notifications,
  loading,
  roleLabel,
  title,
  description,
  emptyTitle,
  emptyMessage
}) {
  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const [query, setQuery] =
    useState("");

  const counts =
    useMemo(
      () => ({
        total: notifications.length,
        unread: notifications.filter(
          (notification) => !notification.is_read
        ).length,
        approved: notifications.filter(
          (notification) =>
            notification.type === "PASS_APPROVED"
        ).length,
        rejected: notifications.filter(
          (notification) =>
            notification.type === "PASS_REJECTED"
        ).length,
        pending: notifications.filter(
          (notification) =>
            notification.type === "PASS_CREATED"
        ).length
      }),
      [notifications]
    );

  const visibleNotifications =
    useMemo(
      () =>
        notifications.filter((notification) => {
          const matchesFilter =
            activeFilter === "ALL" ||
            (
              activeFilter === "UNREAD" &&
              !notification.is_read
            ) ||
            notification.type === activeFilter;

          const searchableText =
            `${notification.title || ""} ${notification.message || ""}`.toLowerCase();

          return (
            matchesFilter &&
            searchableText.includes(
              query.trim().toLowerCase()
            )
          );
        }),
      [
        activeFilter,
        notifications,
        query
      ]
    );

  const statCards = [
    {
      label: "Total",
      value: counts.total,
      color: "text-slate-900"
    },
    {
      label: "Unread",
      value: counts.unread,
      color: "text-blue-700"
    },
    {
      label: "Approved",
      value: counts.approved,
      color: "text-emerald-700"
    },
    {
      label: "Rejected",
      value: counts.rejected,
      color: "text-rose-700"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <FiBell />
            {roleLabel}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {visibleNotifications.length} shown from {notifications.length}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative block md:w-72">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search notifications"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter.value)
                    }
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      activeFilter === filter.value
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {filter.value === "ALL" && <FiFilter />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : visibleNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visibleNotifications.map((notification) => {
              const meta =
                typeMeta[notification.type] ||
                typeMeta.DEFAULT;

              const Icon =
                meta.icon;

              return (
                <article
                  key={notification.notification_id}
                  className={`border-l-4 ${meta.accent} px-5 py-4 transition hover:bg-slate-50`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconBox}`}>
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {notification.type === "PASS_CREATED"
                            ? "New approval request"
                            : notification.title}
                        </h3>

                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.badge}`}>
                          {meta.label}
                        </span>

                        {!notification.is_read && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs font-medium text-slate-400">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FiInbox size={28} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {emptyTitle}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {emptyMessage}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default NotificationCenter;
