const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Image extends Model {}
    
    Image.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        petitionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'petitions', key: 'id' }
        },
        base64Image: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, { sequelize, modelName: 'Image', tableName: 'images', timestamps: true });
    return Image;
};