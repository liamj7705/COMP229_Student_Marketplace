const User = require('../models/User');

// Only the account owner or an admin may change/delete a user
const canModify = (req) => req.user.role === 'admin' || req.user._id.toString() === req.params.id;

// GET /api/users  (admin only)
// check
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user id' });
    next(err);
  }
};

// PUT /api/users/:id  (owner or admin)
exports.updateUser = async (req, res, next) => {
  try {
    if (!canModify(req)) return res.status(403).json({ message: 'Not allowed to update this user' });

    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, program, password } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (program !== undefined) user.program = program;
    if (password) user.password = password; // re-hashed by pre-save hook
    if (req.body.role && req.user.role === 'admin') user.role = req.body.role;

    await user.save();
    const { password: _, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    if (err.code === 11000) return res.status(400).json({ message: 'Email is already registered' });
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user id' });
    next(err);
  }
};

// DELETE /api/users/:id  (owner or admin)
exports.deleteUser = async (req, res, next) => {
  try {
    if (!canModify(req)) return res.status(403).json({ message: 'Not allowed to delete this user' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user id' });
    next(err);
  }
};
