const http = require('http')
const fs = require('fs')
const mysql = require('mysql')
const qs = require('querystring')
const nodemailer = require('nodemailer')
const url = require('url')
const { spawn } = require( 'child_process' )

const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
      user: "german.gladkikh.07@mail.ru",
      pass: "vxiqC28NjqNpiw5dSh7i",
    },
}) // create connection with mail

transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
}) // verify connection with mail

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"12345",
    database: "database",
    port:"3306"
}) // creating sql connection

connection.connect(function(err){
    if(err){
        throw err
    }
    console.log("Connected!")
}) // sql connect

function readFile(path){
    return fs.readFileSync(__dirname + path, 'utf-8')
}

function parseUrl(u){
    return url.parse(u).pathname
}

function urlToType(u){
    switch(u.split(".").at(-1)){
        case "css":
            return ["text/css", u] 
        case "js":
            return ["text/js", u]
        case "svg":
            return ["image/svg+xml", u] 
        default:
            if(u != "/"){
                if(fs.existsSync("html" + u + ".html")){
                    return ["text/html", "/html" + u + ".html"]
                }else{
                    return ["text/html", "/html/404.html"]
                }
            }else{
                return ["text/html", "/html/sign.html"]
            }          
    }
} 

function getPage(ur,res){
    let u = parseUrl(ur)

    let a = u.split("/") 
    if(a[1] == 'userapps'){
        let port = users[a[2]].port
        console.log(port)
        res.writeHead(302, {'Location': 'http://localhost:' + port});
        res.end();
    }else{
        let p = urlToType(u)
        res.writeHead(200,{"Content-Type": p[0]})
        res.end(readFile(p[1]))
    }

    
} // send response to get

function sendData(data, res){
    res.writeHead(200,{"Content-Type": "application/json"})
    res.end(JSON.stringify(data)) 
} // send response to post 


class Verify{
    constructor(login, mail,pass, code){
        this.mail = mail
        this.code = code
        this.pass = pass
        this.login = login
    }
} // all about registration user

function UserInfo(mail){
    this.mail = mail
    this.online = false
    this.port = 0
    this.ls = null
} // объект, который хранит инфу о онлайн пользователе
 
let users = {} // юзеры на сервере

async function Online(){
    let promise = new Promise((resolve,reject) => {
        
        setInterval(()=>{
            console.log(true)
            for(let mail of Object.keys(users)){
                if(users[mail].port != 0){
                    if(users[mail].online == true){
                        console.log(mail + "online")
                    }else{
                        users[mail].ls.on("SIGINT", ()=>{
                            users[mail].port = 0                
                        })
                    }
                    users[mail].online = false
                }
            }
        },10000)

    })

    await promise.then()
} // проверка онлайна у юзера

let all_ports = Array(63000).fill(true)

for(let i = 0; i <= 1000; i++){
        all_ports[i] = false
}

function setPort(){
    for(let i = 0; i <= all_ports.length; i++){
        if(all_ports[i]){
            return i
        }
    }
}


let codes = [] // list of Verify class objects

Online()

const server = http.createServer((req,res) =>{

    // GET
    if(req.method=='GET'){
        getPage(req.url,res) 

    } 

    // POST
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
        }) // getting post 

        
        req.on('end', function () {
            post = qs.parse(body) //JSON.parse(body);
            console.log(post);
            
            if(parseUrl(req.url) == '/verify'){
                let regist = false
                for(let i = 0; i < codes.length; i++){
                    if(url.parse(req.url, true).query.mail == codes[i].mail && codes[i].code == post.verify){
                        let query = `INSERT INTO users(id, login, mail, pass)VALUES(DEFAULT, '${codes[i].login}', '${codes[i].mail}', '${codes[i].pass}');`
                        connection.query(query)
                        console.log(url.parse(req.url, true).query.mail)
                        fs.mkdirSync("userapps/" + url.parse(req.url, true).query.mail)
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
                        passFromDb = Object.values(Object.values(result)[0])[0]
                        console.log(passFromDb)
                        if(pass == passFromDb){
                            connection.query(`SELECT login FROM users WHERE mail IN("${mail}");`, (err,result) =>{
                                if(err){
                                    throw err
                                }else {
                                    let select_login = Object.values(Object.values(result)[0])[0];
                                    let info = {
                                        login : select_login,
                                        pass : passFromDb.length
                                    }
                                    console.log(info.login + " " + info.pass)
                                    sendData(info, res)
                                    users[mail] = new UserInfo(mail)
                                }
                            })
                        }else{
                            sendData("notsign",res)
                        }
                    }
                })

            }
            
            if(parseUrl(req.url) == '/edit'){
                let code = post.code
                let mail = post.mailcode
                
                
                let enter_port = code.includes(".listen(PORT")
                if(enter_port){
                    console.log(users)
                    if(users[mail].port == 0){
                        console.log(users)
                        port = setPort()
                        all_ports[port] = false
                        users[mail].port = port
                    }

                    if(users[mail].ls != null){
                        users[mail].ls.on("SIGINT", ()=>{})
                        console.log("nice")
                    }

                    code = code.replace("PORT", port.toString())
                    sendData("port: " + port.toString(),res)

                    fs.writeFileSync('userapps/' + mail + '/file.js', code)

                    const ls = spawn('node', ['userapps/' + mail + '/file.js'] );//, '--max-old-space-size=100'] );
                    //spawn('cpulimit', ['-l', '5', '-p', ls.pid.toString(), '&']);
                    users[mail].ls = ls

                    users[mail].ls.stdout.on('data', (data) => {
                        
                    })

                    users[mail].ls.on('close', (code) => {
                        console.log("process exit " + mail);
                        console.log(users.mail)
                        all_ports[users[mail].port] = true // освобождение порта
                        users[mail].port = 0
                        users[mail].ls = undefined

                    })

                    console.log(code) 
                }else{
                    sendData("error",res)
                    return 
                }
            }
            
            
            if(parseUrl(req.url) == '/change-login'){
                let mail = post.mail
                let new_login = post.login
                let query = `UPDATE users SET login = '${new_login}' WHERE mail = '${mail}';`
                connection.query(query, (err,result) => {
                    if(err) throw err 
                    sendData("OK", res)
                })
            }

            if(parseUrl(req.url) == '/now-pass'){
                let pass = post.pass
                let mail = post.mail

                let query 
                = `SELECT pass FROM users WHERE mail IN("${mail}");`
                connection.query(query, (err, result) => {
                    if(err) throw err
                    let passFromDb = Object.values(Object.values(result)[0])[0]
                    if(pass == passFromDb){
                        sendData("YES", res)
                    }else{
                        sendData("NO",res)
                    }
                })
            }

            if(parseUrl(req.url) == '/change-pass'){
                let mail = post.mail
                let new_pass = post.pass

                let query = `UPDATE users SET pass = '${new_pass}' WHERE mail = '${mail}';`
                connection.query(query, (err,result) => {
                    if(err) throw err 
                    sendData("OK", res)
                })
            }

            if(parseUrl(req.url) == "/online"){
                let mail = post.mailonline
                console.log(mail)
                if(mail != undefined){
                    users[mail].online = true
                }
            }

        })
    }
})

server.listen(8080, ()=>{
    console.log("Server has been started")
})


