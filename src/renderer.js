const information = document.getElementById('info')
information.innerText = `This app is using Chrome V ${versions.electron()}`

const func = async () =>{
    const response = await window.versions.ping();
    console.log(response);
}

func()