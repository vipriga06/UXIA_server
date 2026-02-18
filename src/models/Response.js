const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Response extends Model {}

    Response.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        petitionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'petitions',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        data: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Response',
        tableName: 'responses'
    });

    return Response;
};
