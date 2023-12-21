const db = require('../database/database')



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

function getggogleidcheck(google_id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM user_register WHERE google_id = ?';
      db.query(query, [google_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  }




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
    getggogleidcheck,
    helpservice
  }