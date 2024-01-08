const bcrypt = require ('bcrypt')
const admin = require('../service/adminService')
const saltRounds = 10;


const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await admin.adminregister({ username, password: hashedPassword });

        const responseMessage = 'Admin registration successful';
        const responseStatus = 201;

        res.status(responseStatus).json({
            message: responseMessage,
            status: responseStatus,
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Failed to register admin' });
    }
}





const loginadmin = async (req, res) => {
    const { username, password } = req.body;
    try {
      admin.loginadmin(username, password, (err, result) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ error: 'An internal server error occurred' });
        }
  
        if (result.error) {
          return res.status(401).json({ status : 401, error: result.error });
        }
  
  
        res.status(201).json({
          message: "admin login succcesfull",
          status: 201,
          data: result.data,
          token: result.token,
        });
  
      });
    } catch (error) {
      console.error('Error logging in admin:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
  };
  



const allcategory = async (req, res) => {
  try {
  
      const clientdata = await admin.getallcategory();

      if (clientdata) {
        res.status(201).json({
          message: "Data fetched successfully",
          status: 201,
          data: clientdata,
        });
      } else {
        const responseMessage =
          "No data found for the provided ID telecaller id.";
        res.status(404).json({
          message: responseMessage,
          status: 404,
        });
      }
    }
   catch (error) {
    console.error("Error in getdataclientwithca:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};


  module.exports = {
    registerAdmin,
    loginadmin,
    allcategory
  }