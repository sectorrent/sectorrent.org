var processing = false, solved = false;
//var nonce, hash;

(function(){
    const forms = document.querySelectorAll(`form[valid-form='${validForm}']`);
    for(const form of forms){
        form.onsubmit = onsubmit
    }

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
