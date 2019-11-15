'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const User = use('App/Models/User')
Route.get('/', async () => {
  return await User.all()
})

Route.group(() => {
  Route.resource('users', 'Admin/UserController')
    .apiOnly()
    .validator(new Map([
      [['store'], ['UserStoreUpdate']],
      [['show'], ['ParamIsExits']],
      [['update'], ['ParamIsExits']],
      [['update'], ['UserStoreUpdate']],
      [['destroy'], ['ParamIsExits']]
    ]))
    .middleware(new Map([
      [['index', 'show', 'update', 'destroy'], ['auth']]
    ]))

  Route.post('login', 'Admin/UserController.login')
}).prefix('admin/')
  .middleware(['country:convertEmptyData'])
  .formats(['json'], true)



