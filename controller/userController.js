const { v4: uuidv4 } = require("uuid");
const { YourSpecificError } = require("../error/error");
const userservice = require("../service/userservice");

const userRegister = async (req, res) => {
  try {
    const { name, image, google_id } = req.body;

    let imagePath;

    // Check if the request contains a file (image)
    if (req.file) {
      imagePath = req.file.filename;
    }

    const googleId = uuidv4();

    const existingUser = await userservice.getggogleidcheck(google_id);

    if (existingUser) {
      return res.status(400).json({
        error: "User with this Google ID already exists.",
      });
    }

    const userRegis = await userservice.registeruser({
      name,
      image: imagePath,
      google_id: googleId,
    });

    res.status(201).json({
      message: userRegis,
      status: 201,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res
        .status(400)
        .json({ error: "An error occurred while processing your request." });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    console.error("Internal Server Error:", error);

    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

const helpcontroller = async (req, res) => {
  const { title, description, email } = req.body;
  const userId = req.user.id;
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        status: 403,
        error: "Forbidden for admin and creator only users can see this ",
      });
    }

    await userservice.helpservice({
      title,
      description,
      email,
      user_id: userId,
    });

    const responseMessage = "help add successfully";
    const responseStatus = 201;

    res.status(responseStatus).json({
      message: responseMessage,
      status: responseStatus,
    });
  } catch (error) {
    console.error("Error create ticket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};
module.exports = {
  userRegister,
  helpcontroller,
};
