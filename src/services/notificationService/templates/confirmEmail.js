const makeConfirmHtml = async (link, token) => {
    
    const confirmHthml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Email Address Confirmation</title>
    </head>
    <body>
        <p>Hello!</p>
        <p>Thank you for registering on our website. Please confirm your email address by clicking the link below:</p>
        <p><a href="${link}${token}" >Confirm Email Address</a></p>
        <p>Best regards,</p>
        <p>The EveryFin Team</p>
    </body>
    </html>
    
    `
    return confirmHthml;
}

module.exports = {makeConfirmHtml} 