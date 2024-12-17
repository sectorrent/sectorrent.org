const archiveThread = document.querySelector('button[action="archive-thread"]');
const unarchiveThread = document.querySelector('button[action="unarchive-thread"]');
const pinThread = document.querySelector('button[action="pin-thread"]');
const unpinThread = document.querySelector('button[action="unpin-thread"]');
const deleteThread = document.querySelector('button[action="delete-thread"]');
const reportThread = document.querySelector('button[action="report-thread"]');
const comments = document.querySelector('comments');

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

        if(processing){
            return;
        }

        processing = true;

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

            processing = false;

        }).catch(function(error){
            console.log(error);
            processing = false;
        });
    };
}

if(unarchiveThread){
    unarchiveThread.onclick = function(e){
        console.log('UN-ARCHIVE');

        if(processing){
            return;
        }

        processing = true;

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

            processing = false;

        }).catch(function(error){
            console.log(error);
            processing = false;
        });
    };
}

if(pinThread){
    pinThread.onclick = function(e){
        console.log('PIN');

        if(processing){
            return;
        }

        processing = true;

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

            processing = false;

        }).catch(function(error){
            console.log(error);
            processing = false;
        });
    };
}

if(unpinThread){
    unpinThread.onclick = function(e){
        console.log('UNPIN');

        if(processing){
            return;
        }

        processing = true;

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

            processing = false;

        }).catch(function(error){
            console.log(error);
            processing = false;
        });
    };
}

if(deleteThread){
    deleteThread.onclick = function(e){
        console.log('DELETE');

        if(processing){
            return;
        }

        processing = true;

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

            processing = false;

        }).catch(function(error){
            console.log(error);
            processing = false;
        });
    };
}

if(reportThread){
    reportThread.onclick = function(e){
        console.log('REPORT');

        if(processing){
            return;
        }

        processing = true;

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

            processing = false;

        }).catch(function(error){
            console.log(error);
            processing = false;
        });
    };
}

function ondeletecomment(e){
    console.log('DELETE');

    if(processing){
        return;
    }

    processing = true;

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

        processing = false;

    }).catch(function(error){
        console.log(error);
        processing = false;
    });
};

function onreportcomment(e){
    console.log('REPORT');

    if(processing){
        return;
    }

    processing = true;

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

        //comment.className = 'reported';

        processing = false;

    }).catch(function(error){
        console.log(error);
        processing = false;
    });
};

function onSubmit(event){
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
                textarea.value = '';
                comments.appendChild(createComment(data.data));
                return;

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

function createComment(data){
    const comment = document.createElement('comment');

    const userIconLink = document.createElement('a');
    userIconLink.className = 'user-icon';
    userIconLink.href = `/u/${data.user.username}`;

    const userIcon = document.createElement('img');
    //userIcon.src = data.user.avatar;
    userIcon.onload = function(e){
        this.className = 'show';
    };
    userIcon.title = data.user.username;
    userIcon.draggable = false;
    userIcon.oncontextmenu = function(e){
        return false;
    };

    userIconLink.appendChild(userIcon);
    comment.appendChild(userIconLink);

    const commentInner = document.createElement('comment-inner');
    commentInner.className = 'new';
    const commentHeader = document.createElement('comment-header');

    const userLink = document.createElement('a');
    userLink.href = `/u/${data.user.username}`;

    if(data.user.role > 1){
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z');
        svg.appendChild(path);
        userLink.appendChild(svg);
    }

    userLink.appendChild(document.createTextNode(data.user.username));
    commentHeader.appendChild(userLink);

    const date = document.createElement('date');
    //date.appendChild(document.createTextNode(data.user.username));
    commentHeader.appendChild(date);

    //OPTIONS APPEND...

    commentInner.appendChild(commentHeader);

    const preview = document.createElement('preview');
    preview.innerHTML = markdownToHtml(data.content);

    commentInner.appendChild(preview);
    comment.appendChild(commentInner);

    return comment;
}
