document.querySelector('.submit').onclick = () => {
    let code = document.getElementById('code').value
    let mail = localStorage.getItem("mail")
    let qs = `code=${code}&mail=${mail}`

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/edit', true)
    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status == 200){

        }
    }
    xhr.send(qs)
}