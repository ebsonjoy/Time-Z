const crypto = require('crypto');


const genaratorOpt = ()=>{
    return crypto.randomBytes(2).toString('hex').toUpperCase();
};

module.exports = {genaratorOpt};