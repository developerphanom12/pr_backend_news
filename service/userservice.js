const db = require('../database/database')
const jwt = require('jsonwebtoken')



function registeruser(creatorData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO user_register( name,image,google_id) 
                           VALUES (?, ?,?)`;

        const values = [
            creatorData.name,
            creatorData.image,
            creatorData.google_id
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding admin:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                if (adminId > 0) {
                    const successMessage = 'user registration successful';
                    resolve(successMessage);
                } else {
                    const errorMessage = 'user registration failed';
                    reject(errorMessage);
                }
            }
        });
    });
}


// function getggogleidcheck(google_id) {
//   return new Promise((resolve, reject) => {
//     const query = 'SELECT * FROM user_register WHERE google_id = ?';
//     db.query(query, [google_id], (err, results) => {
//       if (err) {
//         console.error('Error executing query:', err);
//         reject(err);
//       } else {
//         console.log('Query results:', results);
//         console.log("google_id",google_id)
//         resolve(results);
//       }
//     });
//   });
// } 


const getGoogleIdCheck = (google_id) => {
  return new Promise((resolve, reject) => {
    const checkUserSql = 'SELECT * FROM user_register WHERE google_id = ?';

    db.query(checkUserSql, [google_id], (error, result) => {
      if (error) {
        console.error('Error checking user existence:', error);
        reject(error);
      } else {
        resolve(result.length > 0); 
        console.log(result.length)
      }
    });
  });
};

const login = (google_id, callback) => {
  const query = 'SELECT * FROM user_register WHERE google_id = ?';
  db.query(query, [google_id], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback({ error: 'User not found' }, null);
    }

    const user = results[0];

    const secretKey = process.env.JWT_SECRET 
    console.log("sec",secretKey) // Replace with your actual secret key
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      secretKey
    );

    return callback(null, {
      data: {
        id: user.id,
        name: user.name,
        google_id: user.google_id,
        role: user.role,
        token: token,
      },
    });
  });
};

  
  
const registerlogin = (name, callback) => {
  const query = 'SELECT * FROM user_register WHERE name = ?';
  db.query(query, [name], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback({ error: 'User not found' }, null);
    }

    const user = results[0];

    const secretKey = process.env.JWT_SECRET || 'your-secret-key'; // Replace with your actual secret key
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      secretKey
    );

    return callback(null, {
      data: {
        id: user.id,
        name: user.name,
        google_id: user.google_id,
        role: user.role,
        token: token,
      },
    });
  });
};

  function helpservice(helpData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO help_table( title,description,email,user_id) 
                           VALUES (?, ?,?,?)`;

        const values = [
            helpData.title,
            helpData.description,
            helpData.email,
            helpData.user_id
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding ticket:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                if (adminId > 0) {
                    const successMessage = 'ticket add successful';
                    resolve(successMessage);
                } else {
                    const errorMessage = 'add ticket failed';
                    reject(errorMessage);
                }
            }
        });
    });
}


  module.exports = {
    registeruser,
    getGoogleIdCheck,
    helpservice,
    login,
    registerlogin
  }