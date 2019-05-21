class sqlTable {
    // columns
    static users(Sequelize) {
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            mobile_phone: {
                type: Sequelize.STRING,
                unique: true
            },
            email: {
                type: Sequelize.STRING,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            salt: {
                type: Sequelize.STRING,
                defaultValue: ''
            },
            balance: {
                type: Sequelize.BIGINT,
                defaultValue: 100
            },
            lv: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            membership_expired: {
                type: Sequelize.BIGINT(13),
                defaultValue: 0
            },
            status: {
                type: Sequelize.TINYINT(1),
                defaultValue: 1
            },
            nickname: {
                type: Sequelize.STRING,
                defaultValue: ''
            },
            weixin: {
                type: Sequelize.STRING,
                defaultValue: ''
            },
            qq: {
                type: Sequelize.STRING,
                defaultValue: ''
            },
            address: {
                type: Sequelize.STRING,
                defaultValue: ''
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
