const Joi = require('joi');
const { join } = require('path');


const REGISTERCREATOR = Joi.object({
    creator_name: Joi.string().required(),
    bio: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    bank_number	: Joi.string(),
    ifcs_code  : Joi.string(),
    branch_name	:Joi.string(),
    name_at_bank : Joi.string(),
    password: Joi.string().required()
  });
  
  const VALIDATECREATOR = (req, res, next) => {
    const { error } = REGISTERCREATOR.validate(req.body);
  
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  

    next();
  };
  
  

  module.exports ={
    VALIDATECREATOR
  }