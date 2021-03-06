'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Schedule extends Model {
    relaUser() {
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Schedule
