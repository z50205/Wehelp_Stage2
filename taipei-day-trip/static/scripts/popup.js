const showUserForm=(pivot)=>{
    let mask=document.getElementById("form-mask");
    let login=document.getElementById("login-div");
    let signup=document.getElementById("signup-div");
    if(pivot){
        mask.style.display="block";
        login.style.display="block";
    }else{
        mask.style.display="none";
        login.style.display="none";
        signup.style.display="none";
    }
}
const toggleUserForm=(pivot)=>{
    let login=document.getElementById("login-div");
    let signup=document.getElementById("signup-div");
    if(pivot=="signup"){
        signup.style.display="block";
        login.style.display="none";
    }else if(pivot=="login"){
        signup.style.display="none";
        login.style.display="block";
    }
}
const signForm=document.getElementById("signup-form");
signForm.addEventListener('submit',async (event)=>{
    event.preventDefault(); 
    let name=document.getElementById("signup-name").value;
    let email=document.getElementById("signup-email").value;
    let password=document.getElementById("signup-pw").value;
    let log=document.getElementById("signup-log");
    if (name && email && password){
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        try{
            const response=await fetch("/api/user/",{
                method: "POST",
                body: formData,
            });
            const result=await response.json();
            if (result["ok"]){
                log.textContent="註冊成功";
                document.getElementById("signup-name").value='';
                document.getElementById("signup-email").value='';
                document.getElementById("signup-pw").value='';
            }else{
                switch(result["message"]){
                    case "Repeated Email":
                        log.textContent="電子信箱已使用，請使用其他信箱";
                    break;
                    case "Lack Infos":
                        log.textContent="請輸入完整註冊資料";
                    break;
                    default:
                        log.textContent=result["message"];
                }
            }
        }catch (error) {
                console.error("Error uploading file:", error);
              }
    }else{
        log.textContent="請輸入完整註冊資料"
    }
}
    
);
const loginForm=document.getElementById("login-form");
loginForm.addEventListener('submit',async (event)=>{
    event.preventDefault(); 
    let email=document.getElementById("login-email").value;
    let password=document.getElementById("login-pw").value;
    let log=document.getElementById("login-log");
    if (email && password){
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        try{
            const response=await fetch("/api/user/auth",{
                method: "PUT",
                body: formData,
            });
            const result=await response.json();
            if (result["token"]){
                localStorage.setItem("TOKEN", result["token"]);
                document.getElementById("login-email").value="";
                document.getElementById("login-pw").value="";
                window.location.reload();
            }else{
                switch(result["message"]){
                    case "Login Failed":
                        log.textContent="信箱或密碼有誤";
                    break;
                    case "Email not exist.":
                        log.textContent="信箱不存在";
                    break;
                    default:
                        log.textContent=result["message"];
                }
            }
        }catch (error) {
                console.error(error);
              }
    }else{
        log.textContent="請輸入完整登入資料"
    }
}
    
);
const getMembership=async ()=>{
    try{
        const response=await fetch("/api/user/auth",{
            method: "GET",
            headers: {
                'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
                'Content-Type': 'application/json',
            },
        });
        const result=await response.json();
        let memberButton=document.getElementById("member-button");
        if (result["data"]){
            memberButton.textContent="登出系統";
            memberButton.onclick = ()=>logout();
        }else{
            memberButton.textContent="登入/註冊";
            memberButton.onclick = ()=>showUserForm(true);

        }
    }catch (error) {
        let memberButton=document.getElementById("member-button");
        memberButton.textContent="登入/註冊";
        memberButton.onclick = ()=>showUserForm(true);
          }
}
getMembership();
async function logout(){
    localStorage.removeItem("TOKEN");
    window.location.reload();
}