let menu = document.getElementById('menu')
const xhr = new XMLHttpRequest()
xhr.open("GET", "/menu", true)
xhr.onload = () => {
    if(xhr.status == 200){
        menu.innerHTML = xhr.responseText
    }
}
xhr.send()
