const get_order=async ()=>{
    const paramsString = window.location.search;
    const searchParams = new URLSearchParams(paramsString);
    order_id=searchParams.get("number"); // a  
    let response=await fetch("/api/order/"+order_id,{
        method: "GET",
        headers: {
            'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
        }
    })
    const result=await response.json();
    if(result["data"]){
        document.getElementById("order-id").textContent=result["data"]["number"];
    }else if(result["message"]=="Log in fail."){
        window.location.href="/";
    }
    console.log(result);
}
get_order();