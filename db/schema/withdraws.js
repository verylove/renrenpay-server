class sqlTable {
    // columns
    static withdraws(Sequelize) {
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userid: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            uuid: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            amount: {
                type: Sequelize.FLOAT
            },
            memo: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.TINYINT(1),
                defaultValue: 1
            }
        }
    }

    static publicSet() {
        return {
            freezeTableName: true,
            paranoid: true,
            timestamps: true,
        }
    }
}

module.exports = sqlTable
