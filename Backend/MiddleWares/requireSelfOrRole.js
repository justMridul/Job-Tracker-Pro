// Backend/MiddleWares/requireSelfOrRole.js
// Allows if the authenticated user matches a :param value OR has one of the roles.
module.exports = (param, ...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

  const paramValue = String(req.params[param] || '');
  const isSelf = paramValue && String(req.user.id) === paramValue;
  const hasRole = roles.includes(req.user.role);

  if (isSelf || hasRole) return next();
  return res.status(403).json({ error: 'Forbidden: not owner or lacking role' });
};
