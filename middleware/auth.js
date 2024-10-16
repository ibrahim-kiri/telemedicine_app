exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.isPatient = (req, res, next) => {
  if (req.session.role === "patient") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

exports.isDoctor = (req, res, next) => {
  if (req.session.role === "doctor") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.session.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};
