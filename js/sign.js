function login(mail, pass){
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/sign-in', true)
    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status == 200){
            res = JSON.parse(xhr.response)
            switch(res){
                
                case "notsign":
                    label.style.display = "inherit"
                    label.innerHTML = "Неправильный пароль"
                    pass_html.style.borderBottom = "1px solid red"
                    mail_html.style.borderBottom = "1px solid #ccc"
                    break
                case "notmail":
                    label.style.display = "inherit"
                    label.innerHTML = "Неправильный логин"
                    mail_html.style.borderBottom = "1px solid red"
                    pass_html.style.borderBottom = "1px solid #ccc"
                    break
                default:
                    window.location.href = "/edit"
                    localStorage.setItem("login", res.login)
                    localStorage.setItem("pass", res.pass)
                    localStorage.setItem("mail", mail)
                    break
            }
        }
    }
    xhr.send(qs)
}
let localMail = localStorage.getItem("mail")
let localPass = localStorage.getItem("pass")
if (localMail && localPass){
    login(localMail, localPass);
}
else{
    document.getElementById('submit_sign').onclick = () => {
        let mail = document.getElementById('mail-id').value 
        let pass = document.getElementById('pass').value 
        let qs = `mail=${mail}&pass=${pass}`
        const label = document.querySelector('.warning-label')
        const mail_html = document.querySelector(".mail")
        const pass_html = document.querySelector(".pass")
        login(mail, pass);
    }
}
