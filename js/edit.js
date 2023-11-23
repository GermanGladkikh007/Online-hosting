async function sendOnline(){
    let promise = new Promise((resolve,reject) => {
        setInterval(()=>{
            const xhr_online = new XMLHttpRequest()
            let qs = `mailonline=${localStorage.getItem("mail")}`
            xhr_online.open("POST", "/online")
            xhr_online.onreadystatechange = () => {}
            xhr_online.send(qs)
            console.log(qs)
        }, 10000) 
    })
    await promise.then()
}

sendOnline()

async function sendCode(){
    let promise = new Promise((resolve,reject) => {
        setTimeout(()=>{
            let code = document.getElementById('code').value
            let portHtml = document.getElementById('port')
            let mail = localStorage.getItem("mail")
            let qs = `code=${code}&mailcode=${mail}`

            let port
            const xhr = new XMLHttpRequest()
            xhr.open('POST', '/edit')
            xhr.onreadystatechange = () => {
                if(xhr.readyState == 4 && xhr.status == 200){
                    if(xhr.response == "error"){
                        console.log("error")
                    }else{
                        port = xhr.response
                        console.log(port)
                    }
                }
            }
            xhr.send(qs)
        }, 1000) 
    })
    await promise.then()
}
document.querySelector('.submit').onclick = () => {
    sendCode()
}

