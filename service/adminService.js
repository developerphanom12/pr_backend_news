const db = require('../database/database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')


dotenv.config();


function adminregister(courseData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO admin(username, password) 
                           VALUES (?, ?)`;

        const values = [
            courseData.username,
            courseData.password,
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding admin:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                if (adminId > 0) {
                    const successMessage = 'Admin registration successful';
                    resolve(successMessage);
                } else {
                    const errorMessage = 'Admin registration failed';
                    reject(errorMessage);
                }
            }
        });
    });
}


function loginadmin(username, password, callback) {
    const query = 'SELECT * FROM admin WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, { error: 'Invalid admin' });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return callback(null, { error: 'Invalid password' });
        }

        const secretKey = process.env.JWT_SECRET;
        console.log("secrtetb keyt",secretKey)
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);
        console.log('token', token)
        return callback(null, {
            data: {
                id: user.id,
                username: user.username,
                password: user.password,
                role: user.role,
                token: token,
            }

        });
    });
}



function getallcategory() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * 
        FROM category WHERE is_deleted = 0
      
      `;
  
      db.query(query, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          reject(error);
        } else  {
          resolve(results)
        };
      })
    })
  }


module.exports = {
    adminregister,
    loginadmin,
    getallcategory
}