const makeResetHtml = async (link, token) => {
    
    const resetHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reset Password</title>
    </head>
    <body>
        <p>Hello,</p>
        <p>We received a request to reset your password. Please click the link below to reset your password:</p>
        <p><a href="${link}${token}" >Reset Password</a></p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The EveryFin Team</p>
    </body>
    </html>    
    `
    return resetHtml;
}

module.exports = {makeResetHtml} 