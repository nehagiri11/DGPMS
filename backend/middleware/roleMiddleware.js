function roleMiddleware(
  allowedRoles = []
) {

  return (
    req,
    res,
    next
  ) => {

    const role =
      req.user?.role;

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(role)
    ) {

      return res.status(403).json({
        success: false,
        message: "Access denied",
      });

    }

    next();

  };

}

module.exports =
  roleMiddleware;
