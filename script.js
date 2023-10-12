'use script';

class Model{
    constructor(){
        
        this.todoList = JSON.parse(localStorage.getItem(`todoList`))||[];
    }

    addTodo(todoText){
        const lastTodo = this.todoList.at(-1);
        const todoId = this.todoList.length>0 ? lastTodo.id+1 : 1;
        
        const todo={id:todoId, text:todoText, complete:false, complete:false};
        this.todoList.push(todo);

        this._commit(this.todoList);
    }
    deleteTodo(id){
        this.todoList = this.todoList.filter(todo => todo.id!==id);
        this._commit(this.todoList);
    }
    editTodo(id,editText){
        this.todoList=this.todoList.map(todo => 
            todo.id === id ? {id:todo.id,text:editText, complete:todo.complete}:todo
        );

        this._commit(this.todoList);
    }
    toggleTodo(id){
        // const todo = this.todoList.find(todo => todo.id === id);
        // todo.complete=!todo.complete;
        this.todoList = this.todoList.map(todo => {
            return todo.id === id ? {id:todo.id,text:todo.text, complete:!todo.complete}: todo;
        });

        this._commit(this.todoList);
    }

    _commit(){
        localStorage.setItem(`todoList`,JSON.stringify(this.todoList));
    }
}

class View{

    constructor(){
        // get container
        this.container = this.getElement(`main`);

        // create title
        this.title = this.createElement(`h1`,`title`);
        this.title.textContent = `Todo List`;

        // create form
        this.form = this.createElement(`form`,`todoForm`);
        
        //create input text
        this.inputText = this.createElement(`input`);
        this.inputText.placeholder = `Enter new task`;
        this.inputText.type=`text`;

        // create submitBtn
        this.submitBtn = this.createElement(`button`);
        this.submitBtn.type=`submit`;
        this.submitBtn.classList.add(`btn`,`submit-btn`);
        this.submitBtn.innerText = `Submit`

        this.form.append(this.inputText, this.submitBtn);

        // create todoListEl
        this.todoListEl = this.createElement(`ul`,`todo-list`);

        this.container.append(this.title,this.form,this.todoListEl);

        this._initLocalListener();
        this._tempText=``;

    }
    displayTodoList(todoList){
        // 1. clean current todoListEl
       
        this.todoListEl.innerHTML = ``;

        //2. show a message if todoList is empty
        if(todoList.length === 0){
            const msg = this.createElement(`p`);
            msg.textContent = `Your todo list is empty`;
            this.todoListEl.append(msg);
        }
        else{
            // 3. render todoList
            todoList.forEach(todo=>{
                // 3.1 create a seperate li for each task
                const li = this.createElement(`li`,`todo`);
                li.id = todo.id;

                // 3.2 create a checkbox for each task
                const checkBox = this.createElement(`input`);
                checkBox.type=`checkbox`;
                checkBox.checked = todo.complete;
                

                // 3.3 render text for each task
                const span = this.createElement(`span`);
                span.contentEditable=true;

                //render strikethrough text if checkbox is checked
                const strike = this.createElement(`s`);
                strike.textContent=todo.text;

                todo.complete? span.append(strike) : span.textContent= todo.text;

                // 3.4 render delete button for each task
                const deleteBtn = this.createElement(`button`,`delete-btn`);
                deleteBtn.innerText = `Delete`;

                //3.5 append all elements for each task
                li.append(checkBox,span,deleteBtn);

                this.todoListEl.append(li);
            });
        }

    }
    getElement(selector){
        return document.querySelector(selector);
    }
    createElement(tag,className){
        const element = document.createElement(tag);
        className&&element.classList.add(className);
        return element;
    }
    _initLocalListener(){
        this.todoListEl.addEventListener(`input`,event=>{
            const target = event.target;
            this._tempText = target.innerText;
        })
    }
    bindAddTodo(handler){
        this.form.addEventListener(`submit`, event =>{
            event.preventDefault();
            
            if(!this.inputText.value)return;

            handler(this.inputText.value);
            this.inputText.value=``;
        })
    }
    bindDeleteTodo(handler){
        this.todoListEl.addEventListener(`click`,event=>{
            event.preventDefault();
            const target = event.target;
            if(!target.classList.contains(`delete-btn`))return;
            const id = +target.parentElement.id;
            handler(id);
        })
    }
    bindToggleTodo(handler){
        this.todoListEl.addEventListener(`click`,event=>{
            const target = event.target;
            if(target.type!==`checkbox`)return;
            const id = +target.parentElement.id;
            handler(id);
        })
    }
    bindEditTodo(handler){
        
        this.todoListEl.addEventListener(`focusout`,event=>{
            
            const target = event.target;
            if(!this._tempText) return;
            
            const id= target.parentElement.id;
            handler(+id,this._tempText);
            this._tempText=``;
        });
    }
}

class Controller{
    constructor(model,view){
        this.model=model;
        this.view=view;

        this.view.displayTodoList(this.model.todoList);
        this.view.bindAddTodo(this.handleAddTodo.bind(this));
        this.view.bindDeleteTodo(this.handleDeleteTodo.bind(this));

        this.view.bindToggleTodo(this.handleToggleTodo.bind(this));

        this.view.bindEditTodo(this.handleEditTodo.bind(this));

    }
    handleAddTodo(inputText){
        this.model.addTodo(inputText);
        this.view.displayTodoList(this.model.todoList);
    }
    handleDeleteTodo(id){
        this.model.deleteTodo(id);
        this.view.displayTodoList(this.model.todoList);
    }
    handleToggleTodo(id){
        this.model.toggleTodo(id);
        this.view.displayTodoList(this.model.todoList);
    }
    handleEditTodo(id,editText){
        this.model.editTodo(id,editText);
        this.view.displayTodoList(this.model.todoList);
    }
}

const app = new Controller(new Model(), new View());