let booking_data=null;
fetchdata();
async function fetchdata(){
    let response=await fetch("/api/booking",{
        method: "GET",
        headers: {
            'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
        },
    });
    let result=await response.json();
    if (result["data"]){
        let bookingName=document.getElementById("booking-name");
        let bookingDate=document.getElementById("booking-date");
        let bookingTime=document.getElementById("booking-time");
        let bookingPrice=document.getElementById("booking-price");
        let bookingAddress=document.getElementById("booking-address");
        let bookingImg=document.getElementById("booking-img");
        let bookingButtonPrice=document.getElementById("booking-button-price");
        let bookingTimeText;
        if (result["data"]["time"]=='morning'){
            bookingTimeText="早上 9 點到下午 4 點";
        }else if(result["data"]["time"]=='afternoon'){
            bookingTimeText="下午 2 點到晚上 9 點";
        }
        bookingName.textContent=result["data"]["attraction"]["name"];
        bookingDate.textContent=result["data"]["date"];
        bookingTime.textContent=bookingTimeText;
        bookingPrice.textContent=result["data"]["price"];
        bookingButtonPrice.textContent=result["data"]["price"];
        bookingAddress.textContent=result["data"]["attraction"]["address"];
        bookingImg.src=result["data"]["attraction"]["image"];
        let jwt_dict=parseJwt (localStorage.getItem("TOKEN"));
        let bookingFormUser=document.getElementById("booking-form-user");
        let bookingInfoUserSuccess=document.getElementById("booking-info-user-success");
        let bookingFormEmail=document.getElementById("booking-form-email");
        bookingFormUser.value=jwt_dict["name"];
        bookingInfoUserSuccess.textContent=jwt_dict["name"];
        bookingFormEmail.value=jwt_dict["email"];
        let bookingSuccess=document.getElementById("booking-success");
        bookingSuccess.style.display="flex";
        booking_data={"attraction_id":result["data"]["attraction"]["id"],"attraction_name":result["data"]["attraction"]["name"],"attraction_address":result["data"]["attraction"]["address"],"attraction_image":result["data"]["attraction"]["image"],"date":result["data"]["date"],"time":result["data"]["time"],"price":result["data"]["price"]};
    }else if(result["message"]=="Get record fail."){
        let jwt_dict=parseJwt (localStorage.getItem("TOKEN"));
        let bookingInfoUserFail=document.getElementById("booking-info-user-fail");
        bookingInfoUserFail.textContent=jwt_dict["name"];
        let bookingFail=document.getElementById("booking-fail");
        bookingFail.style.display="flex";
    }else if(result["message"]=="Log in fail."){
        window.location.href="/";
    }
}

async function deleteBookingInfo(){
    let response=await fetch("/api/booking",{
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
                },
            });
    let result=await response.json();
    if (result["ok"]){
        window.location.href="/booking"
    }
}
function parseJwt (token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
