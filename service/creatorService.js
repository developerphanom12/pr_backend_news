const db = require('../database/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')


dotenv.config();

function registerCreator(creatorData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO creator_users_data(creator_name, bio, image, email, phone_number, bank_number, ifcs_code, branch_name, name_at_bank,password) 
                           VALUES (?, ?,?,?,?,?,?,?,?,?)`;

        const values = [
            creatorData.creator_name,
            creatorData.bio,
            creatorData.image,
            creatorData.email,
            creatorData.phone_number,
            creatorData.bank_number,
            creatorData.ifcs_code,
            creatorData.branch_name,
            creatorData.name_at_bank,
            creatorData.password
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding admin:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                if (adminId > 0) {
                    const successMessage = 'Creator registration successful';
                    resolve(successMessage);
                } else {
                    const errorMessage = 'Creator registration failed';
                    reject(errorMessage);
                }
            }
        });
    });
}




function logincreator(email, password, callback) {

    const query = 'SELECT * FROM creator_users_data WHERE email = ?';


    db.query(query, [email], async (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, { error: 'User not found' });
        }

        const user = results[0];

        if (user.is_deleted === 1) {
            return callback(null, { error: 'User not found' });
        }
        if (user.is_approved !== 1) {
            return callback(null, { error: 'You are not approved at this moment' });
        }


        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return callback(null, { error: 'Invalid password' });
        }

        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey);

        return callback(null, {
            data: {
           
                    id: user.id,
                    email: user.username,
                    creator_name: user.creator_name,
                    phone_number: user.phone_number,
                    role: user.role,
                    token: token,
              
            }
        });
    });
}


function commentadd(commentAdd) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO comment_table(post_id,user_id,comment) 
                           VALUES (?,?,?)`;

        const values = [
            commentAdd.post_id,
            commentAdd.user_id,
            commentAdd.comment
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding admin:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                if (adminId > 0) {
                    const successMessage = 'add comment successful';
                    resolve(successMessage);
                } else {
                    const errorMessage = 'add  comment failed';
                    reject(errorMessage);
                }
            }
        });
    });
}

const checkUserExists = (userId) => {
    return new Promise((resolve, reject) => {
      const checkUserSql = 'SELECT * FROM user_register WHERE id = ?';
  
      db.query(checkUserSql, [userId], (error, result) => {
        if (error) {
          console.error('Error checking user existence:', error);
          reject(error);
        } else {
            
          resolve(result.length > 0);
        }
      });
    });
  };



  function getallpost(offset, pageSize) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
        c.id,
          c.creator_id,
          c.media,
          c.title,
          c.descriptions,
          u.id AS category_id,
          u.title,
          cu.creator_name
        FROM post_table c
        INNER JOIN category u ON c.category_id = u.id
        LEFT JOIN  creator_users_data cu ON c.creator_id = cu.id
        LIMIT ?, ?;`;
  
        db.query(query, [offset, parseInt(pageSize, 10)], (error, results) => {
            if (error) {
          console.error('Error executing query:', error);
          reject(error);
        } else {
          const posts = results.map((row) => ({
            id:row.id,
            creator: {
              creator_id: row.creator_id,
              creator_name: row.creator_name,
            },
            media: row.media,
            title: row.title,
            descriptions: row.descriptions,
            category: {
              id: row.category_id,
              title: row.title,
            },
            is_active: row.is_active,
            create_date: row.create_date,
            update_date: row.update_date,
            is_deleted: row.is_deleted,
          }));
  
          resolve(posts);
  
          console.log('Posts retrieved successfully');
        }
      });
    });
  }
  async function getTotalPostCount() {
    const countQuery = 'SELECT COUNT(*) AS totalCount FROM post_table;';
    
    try {
      const results = await new Promise((resolve, reject) => {
        db.query(countQuery, (error, results) => {
          if (error) {
            console.error('Error executing count query:', error);
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
  
      const totalCount = results[0].totalCount;
      return totalCount;
    } catch (error) {
      throw error;
    }
  }
  
const updatestatus = (is_approved,userId,callback) => {
    const updateQuery = 'UPDATE creator_users_data SET is_approved	 = ? WHERE id = ?';
  
    db.query(updateQuery, [is_approved	,userId], (error, result) => {
      if (error) {
        console.error('Error updating application status:', error);
        return callback(error, null);
      }
  
      if (result.affectedRows === 0) {
        return callback(null, { error: 'creator not found' });
      }
  
      return callback(null, { message: 'creator status updated successfully' });
    });
  };

module.exports = {
    registerCreator,
    logincreator,
    checkUserExists,
    getallpost,
    updatestatus,
    commentadd,
    getTotalPostCount
}