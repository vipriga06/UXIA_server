const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Petition extends Model {}

    Petition.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        images: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Petition',
        tableName: 'petitions'
    });

    return Petition;
};
