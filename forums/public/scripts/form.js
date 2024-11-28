var processing = false;

(function(){
    const forms = document.querySelectorAll(`form[valid-form='${validForm}']`);
    for(const form of forms){
        form.onsubmit = onSubmit
    }
}());

function onSubmit(event){
    event.preventDefault();
    if(processing){
        return;
    }
    processing = true;

    const formData = formToJSON(event.target);

    fetch(event.target.getAttribute('action'), {
        method: event.target.getAttribute('method'),
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    
    }).then(response => {
        if(!response.ok){
            throw new Error('Failed to get data');
        }

        return response.json();

    }).then((data) => {
        switch(data.status){
            case 200:
                alert(data.data.message, data.data.link);
                return;

            case 417:
                processing = false;
                if(data.data.fields){
                    for(const key of data.data.fields){
                        document.querySelector("input[name='"+key.type+"']").parentElement.setAttribute('error', key.message);
                    }
                }

            default:
                processing = false;
                document.querySelector('response').textContent = data.data.message;
                break;
        }

    }).catch(function(error){
        console.log(error);
        document.querySelector('response').textContent = error;
        processing = false;
    });
}

function alert(message, link){
    const alert = document.querySelector('alert');
    alert.innerHTML = message;
    alert.className = 'show good';

    setTimeout(function(){
        alert.className = '';
        if(link){
            window.location = link;
        }
    }, 2000);
}

function formAdjust(event){
    event.target.parentElement.removeAttribute('error');
}

function formToJSON(form){
    let formDataEntries = new FormData(form).entries();

    const handleChild = function(obj, keysArr,value){
        let firstK = keysArr.shift();
        firstK = firstK.replace(']', '');

        if(keysArr.length == 0){
            if(firstK == ''){
                if(!Array.isArray(obj)){
                    obj = [];
                }
                obj.push(value);
            }else{
                obj[firstK] = value;
            }
        }else{
            if(firstK == ''){
                obj.push(value);
            }else{
                if(!(firstK in obj)){
                    obj[firstK] = {};
                }
                obj[firstK] = handleChild(obj[firstK], keysArr, value);
            }
        }
        return obj;
    };

    let json = {};
    for(const [key, value] of formDataEntries){
        json = handleChild(json, key.split(/\[/), value);
    }
    return json;
}