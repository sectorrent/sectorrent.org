(function(){
    const selector = document.querySelectorAll('button[action="copy"]');
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
