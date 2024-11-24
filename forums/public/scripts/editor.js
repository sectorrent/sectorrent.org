textarea.onkeydown = function(e){
    if(e.ctrlKey){
        switch(e.key){
            case 'b':
                e.preventDefault();
                onBold();
                break;
                
            case 'i':
                e.preventDefault();
                onItalic();
                break;
                
            case 'l':
                e.preventDefault();
                onLink();
                break;
                
            case 'q':
                e.preventDefault();
                onQuote();
                break;
                
            case 'd':
                e.preventDefault();
                onCode();
                break;
                
            case 'k':
                e.preventDefault();
                onList();
                break;
                
            case 'o':
                e.preventDefault();
                onNumberedList();
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
    onBold();
};

document.getElementById('button-italic').onclick = function(e){
    onItalic();
};

document.getElementById('button-link').onclick = function(e){
    onLink();
};

document.getElementById('button-quote').onclick = function(e){
    onQuote();
};

document.getElementById('button-code').onclick = function(e){
    onCode();
};

document.getElementById('button-list').onclick = function(e){
    onList();
};

document.getElementById('button-num-list').onclick = function(e){
    onNumberedList();
};

function onBold(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '****';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onItalic(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '**';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+1;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onLink(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '[Click here]()';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+13;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onQuote(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '> ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onCode(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '```\n\n```';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+4;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onList(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '- \n- \n- ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}

function onNumberedList(){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '1. \n2. \n3. ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+3;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
}
