
 const jwt = require("jsonwebtoken");
 
 let generateToken = (user, secretSignature, tokenLife) => {
   return new Promise((resolve, reject) => {
     // Định nghĩa những thông tin của user mà bạn muốn lưu vào token ở đây
     const userData = {
       username: user.username,
     }
     // Thực hiện ký và tạo token
     jwt.sign(
       {data: userData},
       secretSignature,
       {
         algorithm: "HS256",
         expiresIn: tokenLife,
       },
       (error, token) => {
         if (error) {
           return reject(error);
         }
         resolve(token);
     });
   });
 }
 
 let verifyToken = (token, secretKey, option) => {
   return new Promise((resolve, reject) => {
     jwt.verify(token, secretKey, option, (error, decoded) => {
       if (error) {
         return reject(error);
       }
       resolve(decoded);
     });
   });
 }

 
 module.exports = {
   generateToken: generateToken,
   verifyToken: verifyToken,
 };