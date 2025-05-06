import Users from "../Models/User.model.js";

const getUser = async (req, res, next) => {
  const { user } = req.user;
  try {
    const existingUser = await Users.findOne({
      $or: [{ email: user }, { mobile: user }],
    });
    if (!existingUser) {
      return res.status(404).json({ error: true, message: "User   not found" });
    }

    res
      .status(200)
      .json({ error: false, message: "User Found", data: existingUser });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const userInfo = req.body;
  const userId = userInfo._id;

  if (!userInfo || typeof userInfo !== "object") {
    throw new Error("Invalid user info provided");
  }

  try {
    await Users.findOneAndUpdate(
      { _id: userId },
      { $set: { ...userInfo } },
      { new: true }
    );
    const updatedUser = await Users.findOne({ _id: userId });
    console.log(updatedUser);
    res.status(201).json({
      error: false,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserImg = async (req, res, next) => {
  const { user } = req.user;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message:
          "No file uploaded. Make sure you're using the correct field name in your form.",
      });
    }

    const existingUser = await Users.findOne({
      $or: [{ email: user }, { mobile: user }],
    });

    if (!existingUser) {
      return res.status(404).json({ error: true, message: "User Not Found" });
    }

    // Store the file path, not the entire file object
    // This assumes your file is accessible via URL after upload
    const filePath = `http://localhost:5500/${req.file.filename}`;

    existingUser.avatar = filePath;

    // Log the file information for debugging
    console.log("Uploaded file details:", req.file);

    // Save the updated user
    await existingUser.save();

    // Return success response with the file path
    res.status(200).json({
      error: false,
      message: "Image updated successfully",
      data: {
        avatar: filePath,
      },
    });
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: true, message: "File size exceeds the limit" });
    }
    console.error("Error updating user image:", error);
    next(error);
  }
};

export { getUser, updateUser, updateUserImg };
