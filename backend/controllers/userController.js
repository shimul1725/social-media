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
    const {
      name,
      bio,
      work,
      education,
      livesIn,
      from,
      relationshipStatus,
      phone,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (work !== undefined) user.work = work;
    if (education !== undefined) user.education = education;
    if (livesIn !== undefined) user.livesIn = livesIn;
    if (from !== undefined) user.from = from;
    if (relationshipStatus !== undefined) user.relationshipStatus = relationshipStatus;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      work: user.work,
      education: user.education,
      livesIn: user.livesIn,
      from: user.from,
      relationshipStatus: user.relationshipStatus,
      phone: user.phone,
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

    const isOwner = user._id.toString() === req.user._id.toString();
    const isFriend = user.friends.some(
      (f) => f._id.toString() === req.user._id.toString()
    );

    // If the account is private and the viewer is not the owner or a friend,
    // return a limited profile without bio details
    if (user.isPrivate && !isOwner && !isFriend) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        isPrivate: true,
        restricted: true,
        followers: user.followers,
        following: user.following,
        friends: user.friends,
      });
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
// @desc    Update privacy setting (public/private account)
// @route   PUT /api/users/privacy
// @access  Private
const updatePrivacy = async (req, res) => {
  try {
    const { isPrivate } = req.body;
    const user = await User.findById(req.user._id);
    user.isPrivate = !!isPrivate;
    await user.save();
    return res.status(200).json({ isPrivate: user.isPrivate });
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
  updatePrivacy,
};