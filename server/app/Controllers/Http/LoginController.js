'use strict'
const Antl = use('Antl')
const Event = use('Event')
const User = use('App/Models/User')
const { validate } = use('Validator')
const { LoggerPermanentException } = use('App/Helpers/Loggers')

class LoginController {
    async normal({ auth, request, response }) {
        let { email, password } = request.post()
        try {
            let jwt = await auth.query((builder) => {
                builder.where('status', true)
            }).withRefreshToken().attempt(email, password)
            return response.sucessResponseFn({ jwt, user: auth.user });
        } catch (error) {
            LoggerPermanentException(error, request, request.post())
            return response.badResponseExceptionFn(request.post(), error.message);
        }
    }

    async redirect({ ally, request }) {
        await ally.driver(request.socialAuthen).redirect()
    }

    async callback({ ally, auth, request, response }) {
        try {
            let fbUser = await ally.driver(request.socialAuthen).getUser()
            let userDetails = {
                login_source: request.socialAuthen,
                first_name: fbUser.getName(),
                last_name: fbUser.getNickname(),
                avatar: fbUser.getAvatar(),
            }
            let whereClause = {
                email: fbUser.getEmail()
            }
            let rules = {
                email: 'required|email|unique:users,email'
            }
            let validation = await validate(whereClause, rules)
            let user;
            if (validation.fails()) {
                await User.query().where(whereClause).update(userDetails)
                user = await User.findBy(whereClause)
            } else {
                user = await User.create({
                    ...userDetails, ...{
                        email: fbUser.getEmail(),
                        role: 3,
                        status: 1
                    }
                })
                Event.fire('user::sendMailNewAccount', user)
            }
            if (!user.status) {
                return response.badResponseExceptionFn(null, Antl.formatMessage('messages.PROFILE_NOT_ACTIVE'));
            }
            let jwt = await auth.withRefreshToken().generate(user)
            return response.sucessResponseFn({ jwt, user });
        } catch (error) {
            LoggerPermanentException(error, request, request.post())
            return response.badResponseExceptionFn(request.post(), Antl.formatMessage('messages.PROFILE_ACCOUNT_NOT_AUTHENTICATE'));
        }
    }
}

module.exports = LoginController