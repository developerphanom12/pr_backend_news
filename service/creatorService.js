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


module.exports = {
    registerCreator,
    logincreator
}