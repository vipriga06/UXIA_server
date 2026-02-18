const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Petition extends Model {}

    Petition.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
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
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        images: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        sequelize,
        modelName: 'Petition',
        tableName: 'petitions'
    });

    return Petition;
};
