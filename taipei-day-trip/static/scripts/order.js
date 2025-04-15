TPDirect.setupSDK(159813, 'app_ArLi4Fx8mxSnwuaHirHeaOZPdIaDEsjawcgn95b8hGmJBoM3eahw5tQbY5Am', 'sandbox')
TPDirect.card.setup({
    fields: {
        number: {
            element: document.getElementById('card-id'),
            placeholder: "**** **** **** ****"
        },
        expirationDate: {
            element: document.getElementById('card-exp'),
            placeholder: 'MM/YY'
        },
        ccv: {
            element: document.getElementById('card-cert'),
            placeholder: 'CVV'
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        $('#orderButton').removeAttr('disabled');
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        $('#orderButton').attr('disabled', true);
        // submitButton.setAttribute('disabled', true)
    }

    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        setNumberFormGroupToError()
    } else if (update.status.number === 0) {
        setNumberFormGroupToSuccess()
    } else {
        setNumberFormGroupToNormal()
    }

    if (update.status.expiry === 2) {
        setNumberFormGroupToError()
    } else if (update.status.expiry === 0) {
        setNumberFormGroupToSuccess()
    } else {
        setNumberFormGroupToNormal()
    }

    if (update.status.ccv === 2) {
        setNumberFormGroupToError()
    } else if (update.status.ccv === 0) {
        setNumberFormGroupToSuccess()
    } else {
        setNumberFormGroupToNormal()
    }
})

$('#orderTappay').on('submit', function (event) {
    event.preventDefault()

    // fix keyboard issue in iOS device
    forceBlurIos()

    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    console.log(tappayStatus)

    // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return
    }

    // Get prime
    TPDirect.card.getPrime(function (result) {
        if (result.status !== 0) {
            return
        }
        createPrime(result.card.prime);
    })
})
const createPrime= async (prime)=>{
    const orderdata={
        "prime": prime,
        "order": {
          "price": booking_data["price"],
          "trip": {
            "attraction": {
              "id": booking_data["attraction_id"],
              "name": booking_data["attraction_name"],
              "address": booking_data["attraction_address"],
              "image": booking_data["attraction_image"]
            },
            "date": booking_data["date"],
            "time": booking_data["time"]
          },
          "contact": {
            "name": document.getElementById("booking-form-user").value,
            "email": document.getElementById("booking-form-email").value,
            "phone": document.getElementById("booking-form-phone").value
          }
        }
      }
    let response=await fetch("/api/orders",{
        method: "POST",
        headers: {
            'Authorization': `Bearer `+localStorage.getItem("TOKEN"),
        },
        body: JSON.stringify(orderdata),
    })
    const result=await response.json();
    if (result["data"]["number"]){
        window.location.href="/thankyou?number="+result["data"]["number"];
    }
}
function setNumberFormGroupToError(selector) {
    $(selector).addClass('has-error')
    $(selector).removeClass('has-success')
}

function setNumberFormGroupToSuccess(selector) {
    $(selector).removeClass('has-error')
    $(selector).addClass('has-success')
}

function setNumberFormGroupToNormal(selector) {
    $(selector).removeClass('has-error')
    $(selector).removeClass('has-success')
}

function forceBlurIos() {
    if (!isIos()) {
        return
    }
    var input = document.createElement('input')
    input.setAttribute('type', 'text')
    // Insert to active element to ensure scroll lands somewhere relevant
    document.activeElement.prepend(input)
    input.focus()
    input.parentNode.removeChild(input)
}

function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}