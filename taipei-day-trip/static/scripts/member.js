let ordernum=null;
init();
initInfo();

function init(){
    let jwt_dict=parseJwt (localStorage.getItem("TOKEN"));
    let memberInfoUserSuccess=document.getElementById("member-name");
    memberInfoUserSuccess.textContent=jwt_dict["name"];
}
const formatDate = (isodate) => {
    const utcDate = new Date(isodate);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    let localTime = new Intl.DateTimeFormat('zh-TW', options).format(utcDate);
    return localTime;
  };
function initInfo(){
    let jwt_dict=parseJwt (localStorage.getItem("TOKEN"));
    let memberInfoFormUser=document.getElementById("info-user");
    let memberInfoFormEmail=document.getElementById("info-email");
    let memberAvatar=document.getElementById("avatar-img");
    memberInfoFormUser.value=jwt_dict["name"];
    memberInfoFormEmail.value=jwt_dict["email"];
    if (jwt_dict["avatar_src"]){
        memberAvatar.src="avatar/"+jwt_dict["avatar_src"];
    }
}

async function getOrderInfo(orderId){
    let response=await fetch("/api/order/"+orderId,{
        method: "GET",
        headers: {
            'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
        }
    })
    const result=await response.json();
    if(result["data"]){
        console.log(result["data"]);
        setOrderInfo(result["data"]);
    }else if(result["message"]=="Log in fail."){
        window.location.href="/";
    }
}
function setOrderInfo(data){
    let orderInfo=document.getElementById("order-info");
    let reOrderPay=document.getElementById("orderTappay");
    reOrderPay.style.display="none";
    let child=orderInfo.lastElementChild;
    while (child) {
        orderInfo.removeChild(child);
        child = orderInfo.lastElementChild;
    }
    let div1=document.createElement("div");
    div1.textContent="訂單編號："+data["number"];
    let div2=document.createElement("div");
    if(data["create_time"]){
        div2.textContent="訂購時間："+formatDate(data["create_time"])
    }else{
        div2.textContent=data["create_time"];
    }
    let div3=document.createElement("div");
    div3.textContent="訂購價格："+data["price"];
    let div4=document.createElement("div");
    let text;
    if(data["status"]==0){
        text="已付款";
        div4.textContent="付款狀態："+text;
    }else{
        text="付款失敗";
        div4.className="order-pay-div";
        let div41= document.createElement("div");
        div4.textContent="付款狀態："+text;
        let button= document.createElement("button");
        button.textContent="重新付款";
        button.className="order-pay-button";
        button.onclick=()=>displayReOrderRorm();
        div4.appendChild(div41);
        div4.appendChild(button);
    }
    let div5=document.createElement("div");
    div5.className="order-attraction-div";
    let img=document.createElement("img");
    img.className="order-attraction-img";
    img.src=data["trip"]["attraction"]["image"];
    let div6=document.createElement("div");
    let div7=document.createElement("div");
    div7.textContent="景點名稱："+data["trip"]["attraction"]["name"];
    let div8=document.createElement("div");
    div8.textContent="景點地址："+data["trip"]["attraction"]["address"];
    let div9=document.createElement("div");
    div9.textContent="行程日期："+data["trip"]["date"];
    let div10=document.createElement("div");
    if(data["trip"]["time"]=="afternoon"){
        text="下午2點到晚上9點";
    }else{
        text="早上9點到下午4點";
    }
    div10.textContent="行程時間："+text;
    let hr=document.createElement("hr");
    hr.className="order-info-divider";
    div6.appendChild(div7);
    div6.appendChild(div8);
    div6.appendChild(div9);
    div6.appendChild(div10);
    div5.appendChild(img);
    div5.appendChild(div6);
    div5.appendChild(hr);
    orderInfo.appendChild(div1);
    orderInfo.appendChild(div2);
    orderInfo.appendChild(div3);
    orderInfo.appendChild(div4);
    orderInfo.appendChild(div5);
    ordernum=data["number"];
}


class OrderPageModel{
    constructor(){
        this.page=1;
        this.nextpage=false;
    }
    nextPage(){
        if (this.nextpage){
        this.page++;
        }
    }
    prevPage(){
        if (this.page>1){
        this.page--;
        }
    }
    getPage(){
        return this.page;
    }
}

class OrderPageView{
    constructor(){
        this.lefticon=document.getElementById("order-table-left-icon");
        this.pageNumber=document.getElementById("order-table-page-number");
        this.righticon=document.getElementById("order-table-right-icon");
    }
    nextPageListener(handler){
        this.righticon.addEventListener("click",handler)
    }
    prevPageListener(handler){
        this.lefticon.addEventListener("click",handler)
    }
    async refreshPage(page){
        this.pageNumber.textContent=page;
        let response=await fetch("/api/orders?page="+page,{
            method: "GET",
            headers: {
                'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
            },
        });
        let result=await response.json();
        if (result["data"]){
            let orders=result["data"];
            let tbody=document.getElementById("table-body");
            let child=tbody.lastElementChild;
            while (child) {
                tbody.removeChild(child);
                child = tbody.lastElementChild;
            }
            for(let i=0;i<orders.length;i++){
                let tr=document.createElement("tr");
                let td1=document.createElement("td");
                td1.textContent=(parseInt(i)+1)+(page-1)*6;
                let td2=document.createElement("td");
                td2.textContent=orders[i]["number"];
                td2.onclick=()=>getOrderInfo(td2.textContent);
                td2.className="order-number-href";
                let td3=document.createElement("td");
                if(orders[i]["create_time"]){
                    td3.textContent=formatDate(orders[i]["create_time"])
                }else{
                    td3.textContent=orders[i]["create_time"];
                }
                let td4=document.createElement("td");
                td4.textContent=orders[i]["price"];
                let td5=document.createElement("td");
                let text;
                if(orders[i]["status"]==0){
                    text="已付款";
                }else{
                    text="付款失敗";
                }
                td5.textContent=text;
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tbody.appendChild(tr);
            }
            return result["nextPage"];
        }
    }
}

class OrderPageController{
    constructor(model, view){
        this.model=model;
        this.view=view;
    }
    
    async init() {
        let nextpage=await this.view.refreshPage(this.model.getPage());
        this.model.nextpage=nextpage;
        this.view.nextPageListener(async ()=>{
            this.model.nextPage();
            let nextpage=await this.view.refreshPage(this.model.getPage());
            // console.log(nextpage);
            this.model.nextpage=nextpage;
        });
        this.view.prevPageListener(async ()=>{
            this.model.prevPage();
            let nextpage=await this.view.refreshPage(this.model.getPage());
            this.model.nextpage=nextpage;
        });
  }


}

const orderPage = new OrderPageController(new OrderPageModel(), new OrderPageView());
orderPage.init();

const TOOL_ORDER = 1;
const TOOL_INFO = 2;

class ToggleToolModel{
    constructor(){
        this.tool=TOOL_ORDER;
    }
    setTool(tool){
        this.tool=tool;
    }
    getTool(){
        return this.tool;
    }
}
class ToggleToolView{
    constructor(){
        this.orderToggle=document.getElementById("order-toggle")
        this.infoToggle=document.getElementById("info-toggle")
        this.order=document.getElementById("order")
        this.info=document.getElementById("info")
    }
    orderListener(handler){
        this.orderToggle.addEventListener("click",handler)
    }
    infoListener(handler){
        this.infoToggle.addEventListener("click",handler)
    }
    showTool(pivot){
        this.order.style.display="none";
        this.info.style.display="none";
        if (pivot==1){
            this.order.style.display="block";
        }else if(pivot==2){
            this.info.style.display="block";
        }
    }
}
class ToggleToolController{
    constructor(model,view){
        this.model=model;
        this.view=view;
    }
    init(){
        this.view.orderListener(()=>{
            this.model.setTool(TOOL_ORDER);
            this.view.showTool(this.model.getTool());
        })
        this.view.infoListener(()=>{
            this.model.setTool(TOOL_INFO);
            this.view.showTool(this.model.getTool());
        })
        this.view.showTool(TOOL_ORDER);
    }
}

const toggleTool = new ToggleToolController(new ToggleToolModel(), new ToggleToolView());
toggleTool.init();


function displayReOrderRorm(){
    let reOrderPay=document.getElementById("orderTappay");
    reOrderPay.style.display="block";
}

let uploadForm= document.getElementById("info-form");
uploadForm.addEventListener("submit",(event)=>{
    event.preventDefault();
    uploadProfile();})
const uploadProfile = async () => {
    const uploadForm=new FormData();
    let uploadFile=document.getElementById("uploadFormFile").files[0];
    if (uploadFile==undefined){
      uploadFile='';
    }
    uploadForm.append("avatar", uploadFile);
    uploadForm.append("name", document.getElementById("info-user").value);
    uploadForm.append("email", document.getElementById("info-email").value);
    const response=await fetch("/api/user/info",{
      method: "PATCH",
      headers: {'Authorization': `Bearer `+localStorage.getItem("TOKEN")},
      body:uploadForm,
    }) 
    const result = await response.json();
    if (result["token"]){
        alert("Upload sucess")
        localStorage.setItem("TOKEN", result["token"]);
        window.location.reload();
    }else if(result["message"]=="Repeated Email"){
        alert("Upload email is reapted.")
    }else {
        alert("Upload fail.")
    }
  };

let avatarFileUpload=document.getElementById("uploadFormFile");
avatarFileUpload.addEventListener("change",()=>{
    let inputFile=document.getElementById("uploadFormFile").files[0];
    let showAvatar=document.getElementById("avatar-img")
    showAvatar.file = inputFile;

    let reader = new FileReader();
    reader.onload = (function (aImg) {
      return function (e) {
        aImg.src = e.target.result;
      };
    })(showAvatar);
    reader.readAsDataURL(inputFile);
})