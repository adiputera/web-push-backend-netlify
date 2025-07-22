const jwt = require('jsonwebtoken');

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = parseInt(process.env.JWT_EXPIRES_IN) || 900; // Default is 15 minutes if not set
    if (jwtSecret) {
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (authHeader && authHeader.startsWith("Basic ")) {
            const base64Credentials = authHeader.split(" ")[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const [clientId, clientSecret] = credentials.split(":");

            if (clientId && clientSecret) {
                const savedSecret = `${process.env['CLIENT_' + clientId.toUpperCase()]}`;
                if (savedSecret && savedSecret === clientSecret) {
                    const token = jwt.sign({
                        iss: 'adiputera',
                        sub: clientId
                    }, jwtSecret, {
                        expiresIn: jwtExpiresIn
                    });
                    return {
                        statusCode: 200,
                        headers: {
                            'content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'access_token': token,
                            'token_type': 'Bearer',
                            'expiresIn': jwtExpiresIn - 10
                        })
                    };
                }
            }
        }
    }

    return {
        statusCode: 401,
        body: JSON.stringify({ 
            error: "Invalid credentials" 
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
}