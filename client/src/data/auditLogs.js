export const getAuditLogs = () => {

  return JSON.parse(
    localStorage.getItem(
      "auditLogs"
    )
  ) || [];

};

export const addAuditLog = (

  user,

  action,

  details

) => {

  const logs =
    getAuditLogs();

  logs.unshift({

    timestamp:
      new Date()
        .toLocaleString(),

    user,

    action,

    details,

  });

  localStorage.setItem(

    "auditLogs",

    JSON.stringify(logs)

  );

};
