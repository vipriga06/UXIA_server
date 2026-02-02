const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Token extends Model {}

    Token.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'Token',
        tableName: 'tokens'
    });

    return Token;
};
