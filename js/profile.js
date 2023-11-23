function isLetter(str) {
    return str.toLowerCase() !== str.toUpperCase()
}

document.getElementById('change-login').onclick = () =>{
    document.querySelector('.change-login').style.display = "inherit"
    document.getElementById('confirm-login').onclick = () => {
        let label = document.getElementById('label-login')
        let login = document.getElementById('login-input')
        if(!login.value){
            label.style.display = "inherit"
            label.innerHTML = "Заполните все поля"
        }else if(!isLetter(login.value[0]) || login.value.length < 3){
            label.style.display = "inherit"
            label.innerHTML = "Имя должно быть минимум из 3 букв и начинатся с буквы"
        }else{
            label.style.display = "none"
            let qs = `login=${login.value}&mail=${localStorage.getItem("mail")}`
            const xhr = new XMLHttpRequest()
            xhr.open("POST", "/change-login", true)
            xhr.onreadystatechange = () =>{
                if(xhr.readyState == 4 && xhr.status == 200){
                    let resp = xhr.response
                    if(resp == '"OK"'){
                        localStorage.setItem("login", login.value)
                        document.getElementById('title-login').innerHTML = localStorage.getItem("login")
                        document.querySelector('.change-login').style.display = "none"
                    }
                }
            }
            xhr.send(qs)
        }
    }
}

document.getElementById('change-password').onclick = () => {
    document.querySelector('.change-pass-form').style.display = "inherit"
    document.getElementById('confirm-pass').onclick = () => {
        let passwords = []
        for(let i = 0; i < 3; i++){
            passwords[i]= document.getElementById("pass" + i).value
        }
        if(passwords[0] && passwords[1] && passwords[2]){
            let pass = passwords[0]
            const xhr = new XMLHttpRequest()
            let qs = `pass=${pass}&mail=${localStorage.getItem("mail")}`
            xhr.open("POST", "/now-pass", true)
            xhr.onreadystatechange = () => {
                if(xhr.status == 200 && xhr.readyState == 4){
                    console.log(xhr.response)
                    if(xhr.response == '"YES"'){
                        document.getElementById('label-for-0').style.display = "none"
                        if(passwords[1] == passwords[2]){
                            document.getElementById('label-for-1').style.display = "none"
                            const xhr2 = new XMLHttpRequest()
                            let qs2 = `pass=${passwords[2]}&mail=${localStorage.getItem("mail")}`
                            xhr2.open("POST", "change-pass", true)
                            xhr2.onreadystatechange = () => {
                                if(xhr2.status == 200 && xhr2.readyState == 4){
                                    if(xhr2.response == '"OK"'){
                                        localStorage.setItem("pass", passwords[2].length )
                                        console.log(passwords[2])
                                        let length = Number(localStorage.getItem("pass"))
                                        let pass
                                        for(let i = 0; i < length; i++){pass = pass + "*"} 
                                        document.getElementById('pass_value').innerHTML = pass.replace("undefined","")
                                        document.querySelector('.change-pass-form').style.display = "none"
                                    }
                                }
                            }
                            xhr2.send(qs2)
                        }else{
                            document.getElementById('label-for-1').innerHTML = "Пароли не совпадают"
                            document.getElementById('label-for-1').style.display = "inherit"
                        }
                    }else if(xhr.response == '"NO"'){
                        document.getElementById('label-for-0').style.display = "inherit"
                        document.getElementById('label-for-1').style.display = "none"
                    }
                }
            }
            xhr.send(qs)
        }else{
            document.getElementById('label-for-1').innerHTML = "Заполните все поля"
            document.getElementById('label-for-1').style.display = "inherit"
            document.getElementById('label-for-0').style.display = "none"
        }
        
    }
}

document.querySelector('.exit-button').onclick = () => {
    localStorage.clear()
    window.location.href = '/'
}
document.getElementById('hide-login').onclick = () =>{
    document.querySelector('.change-login').style.display = "none"
    document.getElementById('login-input').value = ""
}

document.getElementById('hide-pass').onclick = () =>{
    document.querySelector('.change-pass-form').style.display = "none"
    for(let i = 0; i < 3; i++){
        document.getElementById("pass" + i).value = ""
    }
    for(let i = 0; i < 2; i++){
        document.getElementById("label-for-" + i).style.display = "none"
    }
}

