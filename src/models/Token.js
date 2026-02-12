const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Token extends Model {}

    Token.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        }
    }, {
        sequelize,
        modelName: 'Token',
        tableName: 'tokens'
    });

    return Token;
};
