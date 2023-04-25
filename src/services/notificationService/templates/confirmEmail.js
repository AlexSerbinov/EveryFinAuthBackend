const makeConfirmHtml = async (link, token) => {
    
    const confirmHthml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Email Address Confirmation</title>
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
        <h1>Email Address Confirmation</h1>
        <p>Hello!</p>
        <p>Thank you for registering on our website. Please confirm your email address by clicking the link below:</p>
        <p><a href="#" onclick="sendPostRequest();">Confirm Email Address</a></p>
        <p>Best regards,</p>
        <p>The Website Team</p>
    </body>
    </html>
    
    `
    return confirmHthml;
}

module.exports = {makeConfirmHtml} 