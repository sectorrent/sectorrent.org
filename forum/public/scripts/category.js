var processing;

(function(){
    document.getElementById(colorId).onchange = function(e){
        document.querySelector(`label[for='${colorId}'] span`).style.backgroundColor = this.value;
    };

    document.getElementById(deleteId).onclick = ondelete;
}());

function ondelete(e){
    if(processing){
        return;
    }

    processing = true;

    fetch(`https://api.${window.location.domain}/category?id=${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
    
    }).then(response => {
        if(!response.ok){
            throw new Error('Failed to get data');
        }

        return response.json();

    }).then((data) => {
        if(data.status != 200){
            throw new Error(data.status_message);
        }

        alert(data.data.message, data.data.link);

        processing = false;

    }).catch(function(error){
        console.log(error);
        processing = false;
    });
};
