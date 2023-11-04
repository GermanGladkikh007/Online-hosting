const urlParams = new URLSearchParams(window.location.search);
const mail = urlParams.get('mail');

const all_field = document.querySelector(".main_input")
document.getElementById('submit_verify').onclick = () => {
    let qs =`verify=${document.getElementById("verify-id").value}`
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `/verify?mail=${mail}`, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.onreadystatechange = () => {
        if(xhr.status == 200 && xhr.readyState == 4){
            if(JSON.parse(xhr.response) == "regist"){
                window.location.href = "/edit"
            }else if(JSON.parse(xhr.response) == "unregist"){
                document.querySelector('.label_verify').style.display = "inherit"
                all_field.style.borderBottom = "1px solid red"
            }
        }
    }
    xhr.send(qs)
}
