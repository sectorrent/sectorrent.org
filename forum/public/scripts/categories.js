let draggedElement;

document.querySelectorAll('list-body row').forEach(listItem => {
    listItem.addEventListener('dragstart', handleDragstart);
    listItem.addEventListener('dragover', handleDragover);
    listItem.addEventListener('dragleave', handleDragleave);
    listItem.addEventListener('drop', handleDrop);
});

function handleDragstart(event){
    draggedElement = this;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragover(event){
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.classList.add('over');
}

function handleDragleave(){
    this.classList.remove('over');
}

function handleDrop(event){
    event.preventDefault();

    const tempHTML = this.innerHTML;
    this.innerHTML = draggedElement.innerHTML;
    draggedElement.innerHTML = tempHTML;
    
    this.classList.remove('over');
    const tempClassList = [...this.classList];

    this.className = draggedElement.className;
    draggedElement.className = tempClassList.join(' ');
}

function handleDragend(){
    draggedElement = null;
}
