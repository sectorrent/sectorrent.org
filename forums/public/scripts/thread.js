const archiveThread = document.querySelector('button[action="archive-thread"]');
const unarchiveThread = document.querySelector('button[action="unarchive-thread"]');
const pinThread = document.querySelector('button[action="pin-thread"]');
const unpinThread = document.querySelector('button[action="unpin-thread"]');
const deleteThread = document.querySelector('button[action="delete-thread"]');
const reportThread = document.querySelector('button[action="report-thread"]');

var loading = false;

(function(){
    let selector = document.querySelectorAll('button[action="delete-comment"]');
    for(const del of selector){
        del.onclick = ondeletecomment;
    }
    
    selector = document.querySelectorAll('button[action="report-comment"]');
    for(const rep of selector){
        rep.onclick = onreportcomment;
    }
}());

function oncopy(ele){
}

if(archiveThread){
    archiveThread.onclick = function(e){
        console.log('ARCHIVE');

        if(loading){
            return;
        }

        loading = true;

        fetch(`https://api.${window.location.host}/thread/archive?id=${id}`, {
            method: 'POST',
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

            loading = false;

        }).catch(function(error){
            console.log(error);
            loading = false;
        });
    };
}

if(unarchiveThread){
    unarchiveThread.onclick = function(e){
        console.log('UN-ARCHIVE');

        if(loading){
            return;
        }

        loading = true;

        fetch(`https://api.${window.location.host}/thread/archive?id=${id}`, {
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

            loading = false;

        }).catch(function(error){
            console.log(error);
            loading = false;
        });
    };
}

if(pinThread){
    pinThread.onclick = function(e){
        console.log('PIN');

        if(loading){
            return;
        }

        loading = true;

        fetch(`https://api.${window.location.host}/thread/pin?id=${id}`, {
            method: 'POST',
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

            loading = false;

        }).catch(function(error){
            console.log(error);
            loading = false;
        });
    };
}

if(unpinThread){
    unpinThread.onclick = function(e){
        console.log('UNPIN');

        if(loading){
            return;
        }

        loading = true;

        fetch(`https://api.${window.location.host}/thread/pin?id=${id}`, {
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

            loading = false;

        }).catch(function(error){
            console.log(error);
            loading = false;
        });
    };
}

if(deleteThread){
    deleteThread.onclick = function(e){
        console.log('DELETE');

        if(loading){
            return;
        }

        loading = true;

        fetch(`https://api.${window.location.host}/thread?id=${id}`, {
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

            loading = false;

        }).catch(function(error){
            console.log(error);
            loading = false;
        });
    };
}

if(reportThread){
    reportThread.onclick = function(e){
        console.log('REPORT');

        if(loading){
            return;
        }

        loading = true;

        fetch(`https://api.${window.location.host}/thread/report?id=${id}`, {
            method: 'POST',
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

            loading = false;

        }).catch(function(error){
            console.log(error);
            loading = false;
        });
    };
}

function ondeletecomment(e){
    console.log('DELETE');

    if(loading){
        return;
    }

    loading = true;

    fetch(`https://api.${window.location.host}/comment?id=${id}`, {
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

        loading = false;

    }).catch(function(error){
        console.log(error);
        loading = false;
    });
};

function onreportcomment(e){
    console.log('REPORT');

    if(loading){
        return;
    }

    loading = true;

    fetch(`https://api.${window.location.host}/comment/report?id=${id}`, {
        method: 'POST',
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

        loading = false;

    }).catch(function(error){
        console.log(error);
        loading = false;
    });
};
