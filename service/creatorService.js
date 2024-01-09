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
        console.error('Error adding creator:', error);
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
        console.error('Error adding comment:', error);
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


function searchKeyPost(postTitle) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        c.id,
        c.creator_id,
        c.media,
        c.title,
        c.descriptions,
        u.id AS category_id,
        u.title AS category_title,
        cu.creator_name
      FROM
        post_table c
      INNER JOIN
        category u ON c.category_id = u.id
      LEFT JOIN
        creator_users_data cu ON c.creator_id = cu.id
      WHERE
        c.category_id LIKE CONCAT('%', ?, '%');`;

    db.query(query, [postTitle], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const posts = results.map((row) => ({
          id: row.id,
          creator: {
            creator_id: row.creator_id,
            creator_name: row.creator_name,
          },
          media: row.media,
          title: row.title,
          descriptions: row.descriptions,
          category: {
            id: row.category_id,
            title: row.category_title,
          },
        }));

        resolve(posts);

        console.log('Posts retrieved successfully');
      }
    });
  });
}



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
          id: row.id,
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

function getTotalPostCount() {
  return new Promise((resolve, reject) => {
    const countQuery = 'SELECT COUNT(*) AS totalCount FROM post_table;';

    db.query(countQuery, (error, results) => {
      if (error) {
        console.error('Error executing count query:', error);
        reject(error);
      } else {
        const totalCount = results[0].totalCount;
        resolve(totalCount);
      }
    });
  });
}


const updatestatus = (is_approved, userId, callback) => {
  const updateQuery = 'UPDATE creator_users_data SET is_approved	 = ? WHERE id = ?';

  db.query(updateQuery, [is_approved, userId], (error, result) => {
    if (error) {
      console.error('Error while update creator status:', error);
      return callback(error, null);
    }

    if (result.affectedRows === 0) {
      return callback(null, { error: 'creator not found' });
    }

    return callback(null, { message: 'creator status updated successfully' });
  });
};





function likeadd(likeAdd) {
  return new Promise((resolve, reject) => {
    const insertSql = `INSERT INTO likes_table(post_id,user_id) 
                         VALUES (?,?,?)`;

    const values = [
      likeAdd.post_id,
      likeAdd.user_id,
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error('Error adding likes:', error);
        reject(error);
      } else {
        const adminId = result.insertId;

        if (adminId > 0) {
          const successMessage = 'add like successful';
          resolve(successMessage);
        } else {
          const errorMessage = 'add  like failed';
          reject(errorMessage);
        }
      }
    });
  });
}

function getallcommentbypostid(postid) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
          c.id,
          c.post_id,
          c.comment,
          c.updated_at,
          a.id AS user_id,
          a.name
          FROM comment_table c
      LEFT JOIN user_register a ON c.user_id = a.id
      WHERE c.post_id = ?;`;

    db.query(query, postid, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const comments = results.map((row) => ({
          id: row.id,
          post_id: row.post_id,
          comment: row.comment,
          updated_at: row.updated_at,
          user: {
            id: row.user_id,
            name: row.name,
          },
        }));

        resolve(comments);

        console.log('All comments retrieved successfully');
      }
    });
  });
}



function Addfoloowr(addFollower) {
  return new Promise((resolve, reject) => {
    const insertSql = `INSERT INTO follower_table(creator_id,user_id) 
                           VALUES (?,?)`;

    const values = [
      addFollower.creator_id,
      addFollower.user_id,
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error('Error adding follower:', error);
        reject(error);
      } else {
        const adminId = result.insertId;

        if (adminId > 0) {
          const successMessage = 'add follower successful';
          resolve(successMessage);
        } else {
          const errorMessage = 'add  follower failed';
          reject(errorMessage);
        }
      }
    });
  });
}
function getallFollowr(creatorId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
          c.id,
          c.creator_id,
          a.id AS user_id,
          a.name
          FROM follower_table c
      LEFT JOIN user_register a ON c.user_id = a.id
      WHERE c.creator_id = ?;`;

    db.query(query, [creatorId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const follower = results.map((row) => ({
          creator_id: row.creator_id,
          user: {
            id: row.user_id,
            name: row.name,
          },
        }));

        resolve(follower);

        console.log('All follower retrieved successfully');
      }
    });
  });
}


function RemoveFollower(removeFollower) {
  return new Promise((resolve, reject) => {
    const deleteSql = `DELETE FROM follower_table
                       WHERE creator_id = ? AND user_id = ?`;

    const values = [
      removeFollower.creator_id,
      removeFollower.user_id,
    ];

    db.query(deleteSql, values, (error, result) => {
      if (error) {
        console.error('Error removing follower:', error);
        reject(error);
      } else {
        if (result.affectedRows > 0) {
          resolve(true); 
        } else {
          resolve(false); 
        }
      }
    });
  });
}


function RemoveLIke(removeLike) {
  return new Promise((resolve, reject) => {
    const deleteSql = `DELETE FROM likes_table
                       WHERE post_id = ? AND user_id = ?`;

    const values = [
      removeLike.creator_id,
      removeLike.user_id,
    ];

    db.query(deleteSql, values, (error, result) => {
      if (error) {
        console.error('Error removing likes:', error);
        reject(error);
      } else {
        if (result.affectedRows > 0) {
          resolve(true); 
        } else {
          resolve(false); 
        }
      }
    });
  });
}



function getallpostbyId(userId,offset, pageSize) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT
        c.id,
          c.creator_id,
          c.media,
          c.title AS titles,
          c.descriptions,
          u.id AS category_id,
          u.title,
          cu.creator_name
        FROM post_table c
        INNER JOIN category u ON c.category_id = u.id
        LEFT JOIN  creator_users_data cu ON c.creator_id = cu.id
        WHERE c.creator_id = ? AND c.is_deleted = 0
        LIMIT ?, ?;`;

    db.query(query, [userId,offset, parseInt(pageSize, 10)], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const posts = results.map((row) => ({
          id: row.id,
          media: row.media,
          titles: row.titles,
          descriptions: row.descriptions,
          creator: {
            creator_id: row.creator_id,
            creator_name: row.creator_name,
          },
       
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

function searchKeyPosttitle(postTitle) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        c.id,
        c.creator_id,
        c.media,
        c.title,
        c.descriptions,
        u.id AS category_id,
        u.title AS category_title,
        cu.creator_name
      FROM
        post_table c
      INNER JOIN
        category u ON c.category_id = u.id
      LEFT JOIN
        creator_users_data cu ON c.creator_id = cu.id
      WHERE
        c.title LIKE CONCAT('%', ?, '%');`;

    db.query(query, [postTitle], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const posts = results.map((row) => ({
          id: row.id,
          creator: {
            creator_id: row.creator_id,
            creator_name: row.creator_name,
          },
          media: row.media,
          title: row.title,
          descriptions: row.descriptions,
          category: {
            id: row.category_id,
            title: row.category_title,
          },
        }));

        resolve(posts);

        console.log('Posts retrieved successfully');
      }
    });
  });
}


function addPost(postData) {
  return new Promise((resolve, reject) => {
    const insertSql = `INSERT INTO  post_table(creator_id, media, title, descriptions, category_id) 
                           VALUES (?,?,?,?,?)`;

    const values = [
      postData.creator_id,
      postData.media,
      postData.title,
      postData.descriptions,
      postData.category_id
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error('Error adding creator:', error);
        reject(error);
      } else {
        const adminId = result.insertId;

        if (adminId > 0) {
          const successMessage = 'add post  successful';
          resolve(successMessage);
        } else {
          const errorMessage = 'add post failed';
          reject(errorMessage);
        }
      }
    });
  });
}



const checkid = (userId) => {
  return new Promise((resolve, reject) => {
    const checkUserSql = 'SELECT * FROM  creator_users_data WHERE id = ?';

    db.query(checkUserSql, [userId], (error, result) => {
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



const updatepsotdlt = (is_deleted, userId, callback) => {
  const updateQuery = 'UPDATE  post_table SET is_deleted	 = ? WHERE id = ?';

  db.query(updateQuery, [is_deleted, userId], (error, result) => {
    if (error) {
      console.error('Error while update creator status:', error);
      return callback(error, null);
    }

    if (result.affectedRows === 0) {
      return callback(null, { error: 'creator not found' });
    }

    return callback(null, { message: 'creator status updated successfully' });
  });
};



function getdataown(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * 
      FROM creator_users_data WHERE id =? AND is_deleted = 0
    `;

    db.query(query,userId, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else  {
        resolve(results)
      };
    })
  })
}



function RemoveFollowerBycreator(removeFollower) {
  return new Promise((resolve, reject) => {
    const deleteSql = `DELETE FROM follower_table
                       WHERE creator_id = ? AND user_id = ?`;
                       
    const values = [
      removeFollower.creator_id,
      removeFollower.user_id,
    ];

    db.query(deleteSql, values, (error, result) => {
      if (error) {
        console.error('Error removing follower:', error);
        reject(error);
      } else {
        if (result.affectedRows > 0) {
          resolve(true); 
        } else {
          resolve(false); 
        }
      }
    });
  });
}

module.exports = {
  registerCreator,
  logincreator,
  checkUserExists,
  getallpost,
  updatestatus,
  commentadd,
  getTotalPostCount,
  likeadd,
  getallcommentbypostid,
  searchKeyPost,
  Addfoloowr,
  getallFollowr,
  RemoveFollower,
  RemoveLIke,
  getallpostbyId,
  searchKeyPosttitle,
  addPost,
  checkid,
  updatepsotdlt,
  getdataown,
  RemoveFollowerBycreator
}