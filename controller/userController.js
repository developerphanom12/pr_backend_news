const { v4: uuidv4 } = require("uuid");
const { YourSpecificError } = require("../error/error");
const userservice = require("../service/userservice");

const userRegister = async (req, res) => {
  try {
    const { google_id } = req.body;
    const doesUserExist = await userservice.getGoogleIdCheck(google_id);

    if (doesUserExist) {
      userservice.login(google_id, (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "An unexpected error occurred." });
        }
        return res.status(200).json({
          message: "user login succcesfull",
          status: 201,
          data: result.data,
          token: result.token,
        });
      });
    } else {
      const { name } = req.body;
      let imagePath;

      if (req.file) {
        imagePath = req.file.filename;
      }
  
      if (!name) {
        return res.status(400).json({
          error: "Name is required for registration.",
        });
      }
       const googleId = uuidv4()
      const userRegis = await userservice.registeruser({
        name,
        image: imagePath,
        google_id: googleId,
      });

      const newUserToken = userservice.registerlogin(userRegis); 
  if(newUserToken) {
    userservice.registerlogin(name, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An unexpected error occurred." });
      }
      return res.status(200).json({
        message: "user login succcesfull",
        status: 201,
        data: result.data,
        token: result.token,
      });
    });
  }
    }
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
