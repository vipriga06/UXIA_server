const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const Token = require('./Token')(sequelize);
const Petition = require('./Petition')(sequelize);
const Response = require('./Response')(sequelize);

// Relaciones
User.hasMany(Petition, { foreignKey: 'userId' });
Petition.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'userId' });

Petition.hasOne(Response, { foreignKey: 'petitionId', onDelete: 'CASCADE' });
Response.belongsTo(Petition, { foreignKey: 'petitionId' });

module.exports = {
    sequelize,
    User,
    Token,
    Petition,
    Response
};
