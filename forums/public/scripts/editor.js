textarea.addEventListener('keydown', function(e){
    switch(e.key){
        case 'Tab':
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
    
            textarea.value = textarea.value.substring(0, start)+'\t'+textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start+1;
            break;
    }
});

document.getElementById('button-bold').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '****';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};

document.getElementById('button-italic').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '**';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+1;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};

document.getElementById('button-link').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '[Click here]()';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+13;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};

document.getElementById('button-quote').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '> ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};

document.getElementById('button-code').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '```\n\n```';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+4;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};

document.getElementById('button-list').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '- \n- \n- ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+2;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};

document.getElementById('button-num-list').onclick = function(e){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const insertText = '1. \n2. \n3. ';
    textarea.value = text.substring(0, start)+insertText+text.substring(end);

    const cursorPosition = start+3;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition;

    textarea.focus();
};
