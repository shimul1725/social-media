const User = require("../models/User");

// @desc    Get logged-in user's own full profile
// @route   GET /api/users/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "name avatar")
      .populate("following", "name avatar")
      .populate("friends", "name avatar");
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update name / bio
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Get any user's public profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name avatar")
      .populate("following", "name avatar")
      .populate("friends", "name avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Upload / update avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const user = await User.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();

    return res.status(200).json({ avatar: user.avatar });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Upload / update cover photo
// @route   PUT /api/users/cover
// @access  Private
const updateCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const user = await User.findById(req.user._id);
    user.coverPhoto = req.file.path;
    await user.save();

    return res.status(200).json({ coverPhoto: user.coverPhoto });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Search users by name (for finding people to follow)
// @route   GET /api/users/search?q=keyword
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const users = await User.find({
      name: { $regex: keyword, $options: "i" },
      _id: { $ne: req.user._id }, // exclude yourself from results
    })
      .select("name avatar bio")
      .limit(20);

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMyProfile,
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  searchUsers,
};