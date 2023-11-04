const http = require('http')
const fs = require('fs')
const mysql = require('mysql')
const qs = require('querystring')
const nodemailer = require('nodemailer')
const url = require('url')
const { spawn } = require( 'child_process' );

const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
      user: "german.gladkikh.07@mail.ru",
      pass: "vxiqC28NjqNpiw5dSh7i",
    },
});

transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
});

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Everybody123__",
    database: "db",
    port:"3306"
})

connection.connect(function(err){
    if(err){
        throw err
    }
    console.log("Connected!")
})


function readFile(path){
    return fs.readFileSync(__dirname + path, 'utf-8')
}

function parseUrl(u){
    return url.parse(u).pathname
}

function urlToType(u){
    switch(u){
        case "/site": 
            return ["text/html", "/html/index.html"] 
        case "/registration": 
            return ["text/html", "/html/reg.html"]
        case "/verify": 
            return ["text/html", "/html/ver.html"] 
        case "/sign-in": 
            return ["text/html", "/html/sign.html"] 
        case "/google-sign": 
            return ["text/html", "/html/google-sign.html"] 
        case "/edit": 
            return ["text/html", "/html/edit.html"] 
        case "/css/main.css": 
            return ["text/css", "/css/main.css"] 
        case "/css/sign.css": 
            return ["text/css", "/css/sign.css"]
        case "/css/ver.css": 
            return ["text/css", "/css/ver.css"]
        case "/css/reg.css": 
            return ["text/css", "/css/reg.css"]  
        case "/css/404.css": 
            return ["text/css", "/css/reg.css"] 
        case "/js/form.js": 
            return ["text/js", "/js/form.js"] 
        case "/js/verify.js": 
            return ["text/js", "/js/verify.js"] 
        case "/js/sign.js": 
            return ["text/js", "/js/sign.js"] 
        case "/js/edit.js": 
            return ["text/js", "/js/edit.js"] 
        default: 
            return ["text/html", "/html/404.html"] 
    }
}

function getPage(ur,res){
    let u = parseUrl(ur)
    let p = urlToType(u)
    res.writeHead(200,{"Content-Type": p[0]})
    res.end(readFile(p[1]))
}

function sendData(data, res){
    res.writeHead(200,{"Content-Type": "application/json"})
    res.end(JSON.stringify(data)) 
}


class Verify{
    constructor(login, mail,pass, code){
        this.mail = mail
        this.code = code
        this.pass = pass
        this.login = login
    }
}

let codes = []

const server = http.createServer((req,res) =>{
    if(req.method=='GET'){
        getPage(req.url,res) 
    }

    if(req.method=='POST'){
        let body = ''
        let post

        let login
        let mail
        let pass

        req.on('data', function (data) {
            body += data;
            

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        });

        
        req.on('end', function () {
            post = qs.parse(body) //JSON.parse(body);
            console.log(post);
            
            if(parseUrl(req.url) == '/verify'){
                let regist = false
                for(let i = 0; i < codes.length; i++){
                    if(url.parse(req.url, true).query.mail == codes[i].mail && codes[i].code == post.verify){
                        connection.query(`INSERT INTO users(id, login, mail, pass)VALUES(DEFAULT, '${codes[i].login}', '${codes[i].mail}', '${codes[i].pass}');`)
                        codes.splice(i, 1)
                        console.log("Вы зарегистрировались")
                        sendData("regist",res)
                        regist = true
                        break
                    }
                }
                if(!regist){
                    sendData("unregist",res)
                }
            }

            if(parseUrl(req.url) == '/registration'){
                login = post.login;
                mail = post.mail_reg;
                pass = post.pass
                
                let query = `SELECT EXISTS(SELECT * FROM users WHERE mail = '${mail}');`
                connection.query(query, (err, result) => {  
                    if(err){
                        throw err
                    }

                    let mailFromDb = Object.values(Object.values(result)[0])[0]; 
                    console.log(mailFromDb)
                
                    if(!mailFromDb){
                        let code = Math.floor(100000 + Math.random() * 900000)

                        transporter.sendMail({
                            from: 'german.gladkikh.07@mail.ru',
                            to: mail,
                            subject: 'Message',
                            text: `Your verify code: ${code}`
                        }, (err, info) => {
                            console.log(info)
                            if(err){
                                sendData("notexist", res)
                            }else{
                                codes.push(new Verify(login, mail, pass, code))
                                sendData("notexistdb", res)
                            }     
                        });

                    }else if(mailFromDb){   
                        sendData("exist", res)
                        console.log('Уже существующий mail')
                    }
                })   
            }

            if(parseUrl(req.url) == '/sign-in'){
                let mail = post.mail
                let pass = post.pass

                let query 
                = `SELECT pass FROM users WHERE mail IN("${mail}");`
                connection.query(query, (err,result) => {
                    if(err){
                        throw err
                    }
                    let passFromDb
                    console.log(result.length == 0)
                    if(result.length == 0){
                        sendData("notmail",res)
                    }else{
                        passFromDb= Object.values(Object.values(result)[0])[0]; 
                        console.log(passFromDb)
                        if(pass == passFromDb){
                            sendData("sign",res)
                        }else{
                            sendData("notsign",res)
                        }
                    }
                })

            }
            
            if(parseUrl(req.url) == '/edit'){
                let code = post.code
                let mail = post.mail

                console.log(mail)
                fs.writeFileSync("host_codes/file.js", code);
                const ls = spawn('node', ['host_codes/file.js',2000] );//, '--max-old-space-size=100'] );
                //spawn('cpulimit', ['-l', '5', '-p', ls.pid.toString(), '&']);
                ls.stdout.on('data', (data) => {
                    
                });
                ls.on('close', (code) => {
                    console.log("process exit");
                }); 
                console.log(code)
            }
        })
    }
})

server.listen(8080, ()=>{
    console.log("Server has been started")
})
