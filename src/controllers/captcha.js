const Geetest = require('geetest');

const captcha = new Geetest({
    geetest_id: "744ef835de427aef8e716c434b3f359f",
    geetest_key: "a845a1b7a8af6661d63c5c59a2a06ac1"
});

init = async () => {
    const register = async () => {
        const result = await captcha.register().then(function (data) {
            const body = {
                gt: data.gt,
                challenge: data.challenge,
                success: data.success,
                gtserver: 1,
                gtuser_id: "744ef835de427aef8e716c434b3f359f",
                new_captcha: 1,
            };

            return body

        }, function (err) {
            console.error(err);
        });

        return result
    }

    const validate = async (solution) => {
        console.log('<<<<<<<<< solution >>>>>>>>>>>')
        console.log(solution)
        console.log('<<<<<<<<< solution >>>>>>>>>>>')
        if (!solution.geetest_challenge || !solution.geetest_validate || !solution.geetest_seccode) {
            return false
        }
        const result = await captcha.validate({
            challenge: solution.geetest_challenge,
            validate: solution.geetest_validate,
            seccode: solution.geetest_seccode
        }).then(function (success) {

            console.log('<<<<<<<<< success >>>>>>>>>>>')
            console.log(success)
            console.log('<<<<<<<<< success >>>>>>>>>>>')
            if (success) {

                // 二次验证成功，运行用户的操作
                return true

            } else {

                // 二次验证失败，不允许用户的操作
                return false;

            }
        }, function (err) {
            console.error(err);
        })
        return result;
    }

    return {
        register: register,
        validate: validate
    }
}


module.exports = {
    init: init
}