textarea.onkeydown = function(e){
    if(e.ctrlKey){
        switch(e.key){
            case 'b':
                e.preventDefault();
                onbold();
                break;
                
            case 'i':
                e.preventDefault();
                onitalic();
                break;
                
            case 'l':
                e.preventDefault();
                onlink();
                break;
                
            case 'q':
                e.preventDefault();
                onquote();
                break;
                
            case 'd':
                e.preventDefault();
                oncode();
                break;
                
            case 'k':
                e.preventDefault();
                onlist();
                break;
                
            case 'o':
                e.preventDefault();
                onnumberedlist();
                break;
        }
    }

    switch(e.key){
        case 'Tab':
            e.preventDefault(); 
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
    
            textarea.value = textarea.value.substring(0, start)+'\t'+textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start+1;
            break;
    }
};

document.getElementById('button-bold').onclick = function(e){
    onbold();
};

document.getElementById('button-italic').onclick = function(e){
    onitalic();
};

document.getElementById('button-link').onclick = function(e){
    onlink();
};

document.getElementById('button-quote').onclick = function(e){
    onquote();
};

document.getElementById('button-code').onclick = function(e){
    oncode();
};

document.getElementById('button-list').onclick = function(e){
    onlist();
};

document.getElementById('button-num-list').onclick = function(e){
    onnumberedlist();
};

function onbold(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '****';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onitalic(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '**';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+1;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onlink(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '[Click here]()';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+13;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onquote(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '> ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function oncode(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '```\n\n```';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+4;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onlist(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '- \n- \n- ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onnumberedlist(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '1. \n2. \n3. ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+3;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}
