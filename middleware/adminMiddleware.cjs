function requireAdmin(req, res, next) {
    const userRole = req.headers["x-user-role"];

    if (!userRole) {
        return res.status(401).json({ message: "No user role provided" });
    }

    if (userRole !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
}

module.exports = requireAdmin;
