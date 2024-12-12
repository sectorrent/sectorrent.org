const categorySelector = document.getElementById('category-selector');
var currentlySelected = 0;

(function(){
    categorySelector.value = categorySelector.querySelector('fl-option').getAttribute('value');
    categorySelector.onchange = function(e){
        currentlySelected = e.target.value;
    };

    categorySelector.firstElementChild.onclick = function(e){
        if(e.target.getAttribute('value') !== categorySelector.value){
            categorySelector.setAttribute('label', e.target.textContent);
            categorySelector.value = e.target.getAttribute('value');
            categorySelector.selectedIndex = e.target.index;
            categorySelector.parentElement.firstElementChild.value = categorySelector.value;
            categorySelector.dispatchEvent(new Event('change'));
        }
    };
}());

function onpin(){
    
}

function onarchive(){
    
}

function ondelete(){

}
