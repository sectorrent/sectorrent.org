const archiveThread = document.querySelector('button[action="archive-thread"]');
const unarchiveThread = document.querySelector('button[action="unarchive-thread"]');
const pinThread = document.querySelector('button[action="pin-thread"]');
const unpinThread = document.querySelector('button[action="unpin-thread"]');
const deleteThread = document.querySelector('button[action="delete-thread"]');
const reportThread = document.querySelector('button[action="report-thread"]');

(function(){
    //let selector = document.querySelector('archive-thread');
}());

function oncopy(ele){
}

if(archiveThread){
    archiveThread.onclick = function(e){
        console.log('ARCHIVE');
    };
}

if(unarchiveThread){
    unarchiveThread.onclick = function(e){
        console.log('UN-ARCHIVE');
    };
}

if(pinThread){
    pinThread.onclick = function(e){
        console.log('PIN');
    };
}

if(unpinThread){
    unpinThread.onclick = function(e){
        console.log('UNPIN');
    };
}

if(deleteThread){
    deleteThread.onclick = function(e){
        console.log('DELETE');
    };
}

if(reportThread){
    reportThread.onclick = function(e){
        console.log('REPORT');
    };
}
