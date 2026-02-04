const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {}

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        telefon: {
            type: DataTypes.STRING,
            allowNull: false
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user'
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users'
    });

    return User;
};
