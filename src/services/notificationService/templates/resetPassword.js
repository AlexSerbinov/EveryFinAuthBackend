const makeResetHtml = async (link, token) => {
    
    const resetHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reset Password</title>
        <script>
            function sendPostRequest() {
                var xhr = new XMLHttpRequest();
                var url = "${link}";
                var token = "${token}";
                var data = JSON.stringify({ "token": token });
    
                xhr.open("POST", url, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        if (response.message) {
                            alert(response.message);
                        } else {
                            console.log("Server response:", response);
                            alert("Something went wrong. Please check the browser console for details.");
                        }
                    }
                };
                xhr.send(data);
            }
        </script>
    </head>
    <body>
        <h1>Reset Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password. Please click the link below to reset your password:</p>
        <p><a href="#" onclick="sendPostRequest();">Reset Password</a></p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The Website Team</p>
    </body>
    </html>    
    `
    return resetHtml;
}

module.exports = {makeResetHtml} 