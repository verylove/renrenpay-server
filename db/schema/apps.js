class sqlTable {
    // columns
    static apps(Sequelize) {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false
                // unique: true
            },
            callback_url: {
                type: Sequelize.STRING
            },
            whitelist: {
                type: Sequelize.STRING
            },
            appid: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            appsecret: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            pay_userid:{
                type: Sequelize.STRING,
                // allowNull: false
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
