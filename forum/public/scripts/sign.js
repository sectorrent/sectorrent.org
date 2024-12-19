function onsubmit(event){
    event.preventDefault();
    if(processing && !solved){
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
