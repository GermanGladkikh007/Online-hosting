const label_mail = document.querySelector('.label_mail')
const label_all = document.querySelector('.label_all')



document.getElementById('submit_form').onclick = () =>{
    let mail = document.getElementById('mail-reg-id').value
    let login = document.getElementById('login-id').value
    let pass1 = document.getElementById('pass1').value
    let pass2 = document.getElementById('pass2').value

    const mail_html = document.getElementById('mail-reg-id')
    const pass1_html = document.getElementById('pass1')
    const pass2_html = document.getElementById('pass2')
    const login_html = document.getElementById('login-id')
    if(pass1 == pass2){
        label_mail.style.display = "none"
        if(pass1 && mail && login){
            const xhr = new XMLHttpRequest()
            let qs = `login=${login}&mail_reg=${mail}&pass=${pass1}`
            xhr.open('POST', '/registration', true)
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4 && xhr.status == 200){
                    let data = JSON.parse(xhr.response)
                    console.log(data)
                    if(data == "exist"){
                        label_mail.style.display = "inherit"
                        label_all.style.display = "none"
                        label_mail.innerHTML = "Введенный mail уже зарегистрирован"
                        mail_html.style.borderBottom = "1px solid red"
                        pass1_html.style.borderBottom = "1px solid #ccc"
                        pass2_html.style.borderBottom = "1px solid #ccc"
                        login_html.style.borderBottom = "1px solid #ccc"
                    }else if(data == "notexistdb"){
                        window.location.href = `/verify?mail=${mail}`
                    }else if(data == "notexist"){
                        label_mail.style.display = "inherit"
                        label_all.style.display = "none"
                        label_mail.innerHTML = "Введенный mail не существует"
                        mail_html.style.borderBottom = "1px solid red"
                        pass1_html.style.borderBottom = "1px solid #ccc"
                        pass2_html.style.borderBottom = "1px solid #ccc"
                        login_html.style.borderBottom = "1px solid #ccc"
                    }
                }
            }
            xhr.send(qs)
        }else{
            label_all.style.display = "inherit"
            label_all.innerHTML = "Заполните все поля"
            mail_html.style.borderBottom = "1px solid red"
            pass1_html.style.borderBottom = "1px solid red"
            pass2_html.style.borderBottom = "1px solid red"
            login_html.style.borderBottom = "1px solid red"
        }
    }else{
        mail_html.style.borderBottom = "1px solid #ccc"
        login_html.style.borderBottom = "1px solid #ccc"
        pass1_html.style.borderBottom = "1px solid red"
        pass2_html.style.borderBottom = "1px solid red"
        label_all.style.display = "inherit"
        label_all.innerHTML = "Пароли не совпадают"
    }
    
}