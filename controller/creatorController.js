const creatorService = require('../service/creatorService')
const bcrypt = require('bcrypt')




const registerCreatorHandler = async (req, res) => {
    try {
        const { creator_name, bio, email, phone_number, bank_number, ifcs_code, branch_name, name_at_bank, password } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image is required.' });
        }

        const imagePath = req.file.filename;

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('passs',password)
        await creatorService.registerCreator({
            creator_name,
            bio,
            image: imagePath,
            email,
            phone_number,
            bank_number,
            ifcs_code,
            branch_name,
            name_at_bank,
            password:hashedPassword
        });

        const responseMessage = 'Creator registration successful';
        const responseStatus = 201;

        res.status(responseStatus).json({
            message: responseMessage,
            status: responseStatus,
        });
    } catch (error) {
        console.error('Error registering creator:', error);
        res.status(500).json({ error: 'Failed to register creator' });
    }
};




const creatorlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        creatorService.logincreator(email, password, (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({ error: 'An internal server error occurred' });
            }

            if (result.error) {
                return res.status(401).json({ error: result.error });
            }


            res.status(201).json({
                message: "creator login successfully",
                status: 201,
                data: result.data,
                token: result.token,
            });

        });
    } catch (error) {
        console.error('Error logging in creator:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};
module.exports = {
    registerCreatorHandler,
    creatorlogin
}