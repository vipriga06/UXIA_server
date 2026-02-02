const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Response extends Model {}

    Response.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
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
