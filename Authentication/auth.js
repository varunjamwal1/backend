const jwt = require('jsonwebtoken');
const UserModal = require('../Models/user');

// ====================== STUDENT AUTH ======================

// ====================== STUDENT AUTH ======================

exports.studentAuth = async (req, res, next) => {
  try {
    // Accept token from cookie OR Authorization Header
    const token = 
      req.cookies.token || 
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decode = jwt.verify(token, "Its_My_Securet_key");

    req.user = await UserModal.findById(decode.userId).select("-password");

    if (!req.user) {
      return res.status(404).json({ error: "User not found" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Something went wrong in authentication" });
  }
};


// ====================== ADMIN / STAFF AUTH ======================
// ====================== ADMIN / STAFF AUTH ======================

exports.adminStaffAuth = async (req, res, next) => {
  try {
    // Accept token from cookies OR header
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decode = jwt.verify(token, "Its_My_Securet_key");

    req.user = await UserModal.findById(decode.userId).select("-password");

    if (!req.user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ONLY Admin/Staff can access
    if (req.user.role === "student") {
      return res.status(403).json({ error: "You do not have access to this page" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Something went wrong in authentication" });
  }
};
