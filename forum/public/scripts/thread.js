const archiveThread = document.querySelector('button[action="archive-thread"]');
const pinThread = document.querySelector('button[action="pin-thread"]');
const deleteThread = document.querySelector('button[action="delete-thread"]');
const reportThread = document.querySelector('button[action="report-thread"]');
const comments = document.querySelector('comments');
var processing;

(function(){
    if(typeof validForm != 'undefined'){
        document.querySelector(`form[valid-form='${validForm}']`).onsubmit = onsubmit;
    }

    let selector = document.querySelectorAll('button[action="delete-comment"]');
    for(const btn of selector){
        btn.onclick = ondeletecomment;
    }
    
    selector = document.querySelectorAll('button[action="report-comment"]');
    for(const btn of selector){
        btn.onclick = onreportcomment;
    }
    
    selector = document.querySelectorAll('button[action="copy"]');
    for(const btn of selector){
        btn.onclick = function(e){
            oncopy(this);
        };
    }
}());

function oncopy(ele){
    const code = document.getElementById(ele.getAttribute('copy-id'));
    navigator.clipboard.writeText(code.textContent);
}

if(archiveThread){
    archiveThread.onclick = function(e){
        if(processing){
            return;
        }

        processing = true;

        fetch(`https://api.${window.location.domain}/thread/archive?id=${threadId}`, {
            method: archiveThread.getAttribute('method'),
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

            switch(archiveThread.getAttribute('method')){
                case 'PUT':
                    archiveThread.setAttribute('method', 'DELETE');
                    archiveThread.querySelector('svg path').setAttribute('d', 'M20.55,5.22l-1.39-1.68C18.88,3.21,18.47,3,18,3H6C5.53,3,5.12,3.21,4.85,3.55L3.46,5.22C3.17,5.57,3,6.01,3,6.5V19 c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V6.5C21,6.01,20.83,5.57,20.55,5.22z M12,9.5l5.5,5.5H14v2h-4v-2H6.5L12,9.5z M5.12,5 l0.82-1h12l0.93,1H5.12z');
                    archiveThread.querySelector('span').textContent = 'Unarchive thread';
                    document.body.classList.add('archived');
                    break;

                case 'DELETE':
                    archiveThread.setAttribute('method', 'PUT');
                    archiveThread.querySelector('svg path').setAttribute('d', 'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z');
                    archiveThread.querySelector('span').textContent = 'Archive thread';
                    document.body.classList.remove('archived');
                    break;
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
        if(processing){
            return;
        }

        processing = true;

        fetch(`https://api.${window.location.domain}/thread/pin?id=${threadId}`, {
            method: pinThread.getAttribute('method'),
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

            switch(pinThread.getAttribute('method')){
                case 'PUT':
                    pinThread.setAttribute('method', 'DELETE');
                    pinThread.querySelector('svg path').setAttribute('d', 'M2,5.27L3.28,4L20,20.72L18.73,22L12.8,16.07V22H11.2V16H6V14L8,12V11.27L2,5.27M16,12L18,14V16H17.82L8,6.18V4H7V2H17V4H16V12Z');
                    pinThread.querySelector('span').textContent = 'Unpin thread';
                    break;

                case 'DELETE':
                    pinThread.setAttribute('method', 'PUT');
                    pinThread.querySelector('svg path').setAttribute('d', 'M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z');
                    pinThread.querySelector('span').textContent = 'Pin thread';
                    break;
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
        if(processing){
            return;
        }

        processing = true;

        fetch(`https://api.${window.location.domain}/thread?id=${threadId}`, {
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
}

if(reportThread){
    reportThread.onclick = function(e){
        if(processing){
            return;
        }

        processing = true;

        fetch(`https://api.${window.location.domain}/thread/report?id=${threadId}`, {
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
    if(processing){
        return;
    }

    processing = true;

    const id = e.target.getAttribute('comment-id');

    fetch(`https://api.${window.location.domain}/comment?id=${id}`, {
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

        const comment = document.querySelector(`comment[comment-id='${id}'`);
        if(comment){
            comment.remove();
        }

        processing = false;

    }).catch(function(error){
        console.log(error);
        processing = false;
    });
};

function onreportcomment(e){
    if(processing){
        return;
    }

    processing = true;

    const id = e.target.getAttribute('comment-id');

    fetch(`https://api.${window.location.domain}/comment/report?id=${id}`, {
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

        const comment = document.querySelector(`comment[comment-id='${id}'`);
        if(comment){
            comment.className = 'reported';
        }

        processing = false;

    }).catch(function(error){
        console.log(error);
        processing = false;
    });
};

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
                processing = false;
                textarea.value = '';
                comments.appendChild(createComment(data.data));
                document.querySelector('input[type="submit"]').disabled = true;
                document.querySelector('label[type="submit"]').setAttribute('disabled', 'true');
                document.querySelector('pow svg path').setAttribute('d', 'M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z');
                document.querySelector('pow span').textContent = 'PoW verification in progress.';
                pow = data.data.pow;
                solveChallenge(pow.challenge, pow.difficulty);
                break;

            case 400:
                processing = false;
                document.querySelector('input[type="submit"]').disabled = true;
                document.querySelector('label[type="submit"]').setAttribute('disabled', 'true');
                document.querySelector('pow svg path').setAttribute('d', 'M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z');
                document.querySelector('pow span').textContent = 'PoW verification in progress.';
                document.querySelector('response').textContent = data.data.message;
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

function createComment(data){
    const comment = document.createElement('comment');
    comment.setAttribute('comment-id', data._id);

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
    date.appendChild(document.createTextNode(timeAgo(new Date(data.created))));
    commentHeader.appendChild(date);

    const action = document.createElement('action');

    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z');
    svg.appendChild(path);
    action.appendChild(svg);

    const ul = document.createElement('ul');

    let li = document.createElement('li');
    let a = document.createElement('a');
    a.href = `/r/${data._id}/edit`;

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
    svg.appendChild(path);
    a.appendChild(svg);
    a.appendChild(document.createTextNode('Edit comment'));
    li.appendChild(a);
    ul.append(li);


    li = document.createElement('li');
    let button = document.createElement('button');
    button.setAttribute('comment-id', data._id);
    button.className = 'delete';
    button.setAttribute('delete-comment', 'delete-comment');
    button.onclick = ondeletecomment;

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z');
    svg.appendChild(path);
    button.appendChild(svg);
    button.appendChild(document.createTextNode('Delete comment'));
    li.appendChild(button);
    ul.append(li);

    action.appendChild(ul);
    commentHeader.appendChild(action);

    commentInner.appendChild(commentHeader);

    const preview = document.createElement('preview');
    preview.innerHTML = markdownToHtml(data.content);

    commentInner.appendChild(preview);
    comment.appendChild(commentInner);

    return comment;
}

function timeAgo(date){
    const now = new Date();
    const diff = now-date;

    const seconds = Math.floor(diff/1000);
    const minutes = Math.floor(seconds/60);
    const hours = Math.floor(minutes/60);
    const days = Math.floor(hours/24);
    const weeks = Math.floor(days/7);

    if(seconds < 60){
        return 'now';
    }else if(minutes < 60){
        return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    }else if(hours < 24){
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }else if(days < 7){
        return `${days} ${days === 1 ? 'day' : "days"} ago`;
    }else if(weeks < 4){
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }else{
        return date.toLocaleDateString();
    }
}
