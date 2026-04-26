//role based access control 

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) =>{
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                error: "Access denied! user role not identified."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied! '${req.user.role}'' is not authorized to perform this action`
            });
        }

        next();
    };
};

module.exports = authorizeRoles;