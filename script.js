// Model

class TodoModel {
  constructor() {
    this.todos = [];
  }
  addTodo(text) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text,
      done: false,
    };
    this.todos.push(todo);
    this.onTodoListChanged(this.todos)
  }
  editTodo(id, updatedText) {
    this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: updatedText, done: todo.done }
        : todo
    );
    this.onTodoListChanged(this.todos)
  }
  deleteTodo(id) {
    this.todos.filter((todo) => todo.id !== id);
    this.onTodoListChanged(this.todos)
  }
  toggleTodo(id) {
    this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: updatedText, done: !todo.done }
        : todo
    );
    this.onTodoListChanged(this.todos)
  }
  bindTodoListChanged(callback){
    this.onTodoListChanged=callback
  }
}

class View {
  constructor() {
    this.input = this.getElement(".new-todo");
    this.todoListContainer = this.getElement(".todo-list-container");
    this.todoList = this.createElement("ul", "todo-list");
    this.todoListContainer.append(this.todoList);
  }
  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  }
  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }
  get _todoText() {
    return this.input.value;
  }
  _resetInput() {
    this.input.value = "";
  }
  displayTodos(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }
    if (todos.length > 0) {
      todos.forEach((todo) => {
        const li = this.createElement("li");
        li.id = todo.id;

        //checkbox
        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.done;

        // editable span
        const span = this.createElement("span");
        span.contentEditable = true;
        span.classList.add("editable");

        if (todo.done) {
          const strike = this.createElement("s");
          strike.textContent = todo.text;
          span.append(strike);
        } else {
          span.textContent = todo.text;
        }
        const deleteButton = this.createElement("button", "delete");
        deleteButton.textContent = "Delete";
        li.append(checkbox, span, deleteButton);

        this.todoList.append(li);
      });
    }
  }
  bindAddTodo(handler) {
    this.input.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        if (this._todoText) {
          handler(this._todoText);
          this._resetInput();
        }
      }
    });
  }
  bindDeleteTodo(handler) {
    this.todoList.addEventListener("click", (event) => {
      if (event.target.className === "delete") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }
  bindToggleTodo(handler) {
    this.todoList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);
        handler(id)
      }
    });
  }
}
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handdleToggleTodo)
    this.model.bindTodoListChanged(this.onTodoListChanged)

    this.onTodoListChanged(this.model.todos);
  }
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
  };
  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText);
  };
  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
    console.log("delete clicked",id);
  };
  handdleToggleTodo = (id) => {
    this.model.toggleTodo(id);
  };
}

const app = new Controller(new TodoModel(), new View());
