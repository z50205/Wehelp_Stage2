async function init(){
    let listbar_parent=document.getElementsByClassName("listbar-content-inner")[0];
    let response=await fetch("api/mrts");
    let result=await response.json();
    let mrts=result["data"];
    let left_scroll=document.getElementsByClassName("listbar-button-icon")[0];
    let right_scroll=document.getElementsByClassName("listbar-button-icon")[1];
    left_scroll.addEventListener("click",()=>{
        let listbar=document.getElementsByClassName("listbar-content-inner")[0];
        let listbar_outer=document.getElementsByClassName("listbar-content")[0];
        if(scroll>-(listbar.offsetWidth-listbar_outer.offsetWidth)){
            scroll=Math.max(scroll-scroll_step,-(listbar.offsetWidth-listbar_outer.offsetWidth));
            listbar.style.left=scroll+"px";
        }
    })
    right_scroll.addEventListener("click",()=>{
        let listbar=document.getElementsByClassName("listbar-content-inner")[0];
        if(scroll<0){
            scroll=Math.min(scroll+scroll_step,0);
            listbar.style.left=scroll+"px";
        }
    })
    document.addEventListener("scroll",()=>{
        let body=document.getElementsByTagName("body")[0];
        if (body.getBoundingClientRect().bottom<=window.innerHeight+1)
        {
            attraction_add(nextPage);
        }
    })
    for (i in mrts){
        let listbar_item=document.createElement("div");
        listbar_item.setAttribute("class","listbar-content-item");
        listbar_item.setAttribute("onclick",'getAttractionsByMrt("'+mrts[i]+'")');
        listbar_item.textContent=mrts[i];
        listbar_parent.appendChild(listbar_item);
    }
    attraction_add(0);
}
init();
let scroll=0;
let scroll_step=300;
let keyWord=null;
let nextPage=null;
let fetchOnce=true;
async function attraction_add(page){
    if (fetchOnce){
        fetchOnce=false;
        let attraction_parent=document.getElementsByClassName("attraction")[0];
        if (keyWord==null){
            response=await fetch("api/attractions?page="+page);
        }else{
            response=await fetch("api/attractions?page="+page+"&keyword="+keyWord);
        }
        result=await response.json();
        let attractions=result["data"];
        nextPage=result["nextPage"];
        for (i in attractions){
            let title=document.createElement("div");
            title.setAttribute("class","attraction-item-title");
            title.textContent=attractions[i]["name"];
            let titlediv=document.createElement("div");
            titlediv.setAttribute("class","attraction-item-titlediv");
            titlediv.appendChild(title);
            let img=document.createElement("img");
            img.setAttribute("class","attraction-item-image");
            img.setAttribute("src",attractions[i]["images"][0]);
            let imagediv=document.createElement("div");
            imagediv.setAttribute("class","attraction-item-imagediv");
            imagediv.appendChild(img);
            imagediv.appendChild(titlediv);
            let info1=document.createElement("div");
            info1.setAttribute("class","attraction-item-info");
            info1.textContent=attractions[i]["mrt"];
            let info2=document.createElement("div");
            info2.setAttribute("class","attraction-item-info");
            info2.textContent=attractions[i]["category"];
            let infodiv=document.createElement("div");
            infodiv.setAttribute("class","attraction-item-infodiv");
            infodiv.appendChild(info1);
            infodiv.appendChild(info2);
            let item=document.createElement("div");
            item.setAttribute("class","attraction-item");
            item.appendChild(imagediv);
            item.appendChild(infodiv);
            attraction_parent.appendChild(item);
        }
        fetchOnce=true;
    }
}
async function getAttractionsByMrt(keyword){
    let attraction_parent=document.getElementsByClassName("attraction")[0];
    attraction_parent.replaceChildren();
    keyWord=keyword;
    attraction_add(0);
}
async function searchClick(){
    let attraction_parent=document.getElementsByClassName("attraction")[0];
    attraction_parent.replaceChildren();
    keyWord=document.getElementsByClassName("search-bar-text")[0].value;
    attraction_add(0);
}
