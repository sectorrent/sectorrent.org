var processing = false, solved = false;
//var nonce, hash;

(function(){
    document.querySelector(`form[valid-form='${validForm}']`).onsubmit = onsubmit;
    
    solveChallenge(pow.challenge, pow.difficulty);
}());

async function solveChallenge(challenge, difficulty = 4){
    solved = false;
    const encoder = new TextEncoder();
    let nonce = 0;

    while(true){
        const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(challenge+nonce));

        const hashArray = Array.from(new Uint8Array(buffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if(hashHex.startsWith('0'.repeat(difficulty))){
            pow.nonce = nonce;
            document.querySelector('input[type="submit"][disabled]').disabled = false;
            document.querySelector('label[type="submit"][disabled]').removeAttribute('disabled');
            document.querySelector('pow svg path').setAttribute('d', 'M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z');
            document.querySelector('pow span').textContent = 'PoW verification complete.';
            solved = true;
            break;
        }

        nonce++;
    }
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

function onsubmit(event){
    event.preventDefault();
    if(processing || !solved){
        return;
    }
    processing = true;

    const formData = formToJSON(event.target);
    formData.pow = pow;

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
                break;

            case 400:
                processing = false;
                document.querySelector('input[type="submit"]').disabled = true;
                document.querySelector('label[type="submit"]').setAttribute('disabled', 'true');
                document.querySelector('pow svg path').setAttribute('d', 'M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z');
                document.querySelector('pow span').textContent = 'PoW verification in progress.';
                document.querySelector('response').textContent = data.status_message;
                pow = data.data.pow;
                solveChallenge(pow.challenge, pow.difficulty);
                break;

            case 417:
                processing = false;
                if(data.data.fields){
                    for(const key of data.data.fields){
                        const match = key.type.match(/^([a-zA-Z].*)\[([0-9]).*?\]$/);
                        if(match){
                            document.querySelectorAll(`[key='${match[1]}']`)[parseInt(match[2])].parentElement.setAttribute('error', key.message);;
                            continue;
                        }

                        document.querySelector(`[key='${key.type}']`).parentElement.setAttribute('error', key.message);
                    }
                }

                document.querySelector('input[type="submit"]').disabled = true;
                document.querySelector('label[type="submit"]').setAttribute('disabled', 'true');
                document.querySelector('pow svg path').setAttribute('d', 'M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z');
                document.querySelector('pow span').textContent = 'PoW verification in progress.';
                pow = data.data.pow;
                solveChallenge(pow.challenge, pow.difficulty);
                break;

            default:
                processing = false;
                document.querySelector('response').textContent = data.status_message;
                break;
        }

    }).catch(function(error){
        console.log(error);
        document.querySelector('response').textContent = error;
        processing = false;
    });
}
