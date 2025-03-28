function init(){
    fetchdata();
    let left_arrow=document.getElementById("left-arrow");
    let right_arrow=document.getElementById("right-arrow");
    left_arrow.addEventListener("click", () => slideChange(-1));
    right_arrow.addEventListener("click",() => slideChange(1));
    let morning_but=document.getElementsByClassName("attraction-reserveform-time")[0];
    let afternoon_but=document.getElementsByClassName("attraction-reserveform-time")[1];
    morning_but.addEventListener("click",()=>timeChoose(0));
    afternoon_but.addEventListener("click",()=>timeChoose(1));
}
let time=0;
let slide_index=0;
let slide_len;
init();
async function fetchdata(){
    let response=await fetch("/api"+window.location.pathname);
    let result=await response.json();
    console.log(result);
    let title=document.getElementsByClassName("attraction-title")[0];
    title.textContent=result["data"]["name"];
    let station=document.getElementsByClassName("attraction-station")[0];
    if (result["data"]["mrt"]!=null){
        station.textContent=result["data"]["category"]+" at "+result["data"]["mrt"];
    }else{
        station.textContent=result["data"]["category"]
    }
    let description=document.getElementsByClassName("attraction-desc")[0];
    description.textContent=result["data"]["description"];
    let address=document.getElementsByClassName("attraction-desc-text")[0];
    address.textContent=result["data"]["address"];
    let transport=document.getElementsByClassName("attraction-desc-text")[1];
    transport.textContent=result["data"]["transport"];

    let images_src=result["data"]["images"];
    slide_len=images_src.length;
    let img_parent=document.getElementsByClassName("attraction-imgdiv-inner")[0];
    let img_firstChild=document.getElementsByClassName("attraction-img-floatdiv2")[0];
    let img_child=document.createElement("img");
    img_child.setAttribute("class","attraction-img active");
    img_child.setAttribute("src",images_src[0]);
    img_parent.insertBefore(img_child,img_firstChild);
    let dot_parent=document.getElementsByClassName("attraction-slide-dotdiv")[0];
    let dot_child=document.createElement("span");
    dot_child.setAttribute("class","attraction-slide-dot");
    dot_parent.appendChild(dot_child);
    for (i=1;i<images_src.length;i++){
        let img_child=document.createElement("img");
        img_child.setAttribute("class","attraction-img");
        img_child.setAttribute("src",images_src[i]);
        img_parent.insertBefore(img_child,img_firstChild);
        let dot_child=document.createElement("span");
        dot_child.setAttribute("class","attraction-slide-dot");
        dot_parent.appendChild(dot_child);
    }
    let first_dot_child=document.getElementsByClassName("attraction-slide-dot")[0];
    first_dot_child.classList.add("active");

}
function slideChange(dir){
    let imgs=document.getElementsByClassName("attraction-img");
    let dot_childs=document.getElementsByClassName("attraction-slide-dot");
    imgs[slide_index].classList.remove("active");
    dot_childs[slide_index].classList.remove("active");
    slide_index=slide_index+dir;
    if (slide_index>=slide_len){
        slide_index=slide_index-slide_len;
    }
    if (slide_index<0){
        slide_index=slide_len-1;
    }
    imgs[slide_index].classList.add("active");
    dot_childs[slide_index].classList.add("active");
}
function timeChoose(part){
    if (time!=part){
    time=part;
    let time_pivot;
    if (time==0){
        time_pivot=[0,1];
        document.getElementById("cost").textContent="新台幣2000元"
    }else{
        time_pivot=[1,0];
        document.getElementById("cost").textContent="新台幣2500元"
    }
    let timeDotParent=document.getElementsByClassName("dot")[time_pivot[0]];
    let innerDot=document.createElement("span");
    innerDot.setAttribute("class","inner-dot");
    timeDotParent.appendChild(innerDot);
    let timeDotParent_anoter=document.getElementsByClassName("dot")[time_pivot[1]];
    timeDotParent_anoter.removeChild(timeDotParent_anoter.firstChild);}
}