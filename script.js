// Model
class TodoModel {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
  }
  addTodo(text) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text,
      done: false,
    };
    this.todos.push(todo);
    this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }
  editTodo(id, updatedText) {
    console.log("edittt");
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: updatedText, done: todo.done }
        : todo
    );
    this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }
  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }
  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { id: todo.id, text: todo.text, done: !todo.done } : todo
    );
    this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }
  clearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.done);
    this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }
  toggleAll(state) {
    this.todos = this.todos.map((todo) => {
      return {
        id: todo.id,
        text: todo.text,
        done: state,
      };
    });
    this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }
  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }
  _commit(todos) {
    this.onTodoListChanged(todos);
    localStorage.setItem("todos", JSON.stringify(todos));
  }
}

class View {
  constructor() {
    this.input = this.getElement(".new-todo");
    this.todoListContainer = this.getElement(".todo-list-container");
    this.todoList = this.createElement("ul", "todo-list");
    this.clearCompleted = this.getElement(".clear-completed");
    this.toggleAll = this.getElement(".toggle-all");
    this.todoListContainer.append(this.todoList);
    this.updateActiveFilterUi();
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
    const urlList = window.location.hash.split("/");
    const filter = urlList[urlList.length - 1];
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }
    if (todos.length > 0) {
      todos.forEach((todo) => {
        if (
          (filter === "active" && !todo.done) ||
          (filter === "completed" && todo.done) ||
          filter === ""
        ) {
          const li = this.createElement("li");
          li.id = todo.id;
          const checkbox = this.createElement("input", "toggle");
          checkbox.type = "checkbox";
          checkbox.checked = todo.done;

          const label = this.createElement("label");

          if (todo.done) {
            const strike = this.createElement("s");
            strike.textContent = todo.text;
            label.append(strike);
          } else {
            label.textContent = todo.text;
          }
          const deleteButton = this.createElement("button", "destroy");
          li.append(checkbox, label, deleteButton);
          const view = this.createElement("div", "view");
          view.append(li);
          this.todoList.append(view);
        }
      });
    }
  }
  updateFooter(todos) {
    if (todos.length > 0) {
      const footer = this.getElement(".opt-footer");
      footer.style.display = "flex";
      const todoCount = this.getElement(".todo-count span");
      todoCount.textContent = todos.filter((todo) => !todo.done).length;
    } else {
      const footer = this.getElement(".opt-footer");
      footer.style.display = "none";
    }

    // completed todos
    const completed = todos.filter((todo) => todo.done);
    if (completed.length > 0) {
      this.clearCompleted.textContent = "Clear Completed";
    } else {
      this.clearCompleted.textContent = "";
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
    this.input.addEventListener("blur", () => {
      if (this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
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
      if (event.target.className === "destroy") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }
  bindClearCompleted(handler) {
    this.clearCompleted.addEventListener("click", handler);
  }
  bindToggleTodo(handler) {
    this.todoList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);
        console.log(id);
        handler(id);
      }
    });
  }
  bindEditTodo(handler) {
    this.todoList.addEventListener("dblclick", (event) => {
      if (event.target.tagName === "LABEL") {
        event.target.addEventListener("blur", () => {
          event.target.removeAttribute("contentEditable");
          const id = parseInt(event.target.parentElement.id);
          handler(id, event.target.textContent);
        });
        event.target.addEventListener("keyup", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.target.removeAttribute("contentEditable");
            const id = parseInt(event.target.parentElement.id);
            handler(id, event.target.textContent);
          }
        });
        event.target.parentElement.classList.add("editing");
        event.target.setAttribute("contentEditable", true);
        console.log(event.target.parentElement);
      }
    });
  }
  bindFilterChanged(handler) {
    const ul = this.getElement(".filters");
    ul.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        let links = ul.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
          links[i].classList.remove("selected");
        }
        event.target.classList.add("selected");
      }
    });
    window.onhashchange = function () {
      const urlList = window.location.hash.split("/");
      const filter = urlList[urlList.length - 1];
      handler(filter);
    };
  }
  bindToggleAll(handler) {
    this.toggleAll.addEventListener("change", (event) => {
      handler(event.target.checked);
    });
  }
  updateActiveFilterUi() {
    const urlList = window.location.hash.split("/");
    const filter = urlList[urlList.length - 1];
    const ul = this.getElement(".filters");
    let links = ul.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].id === `filter-${filter}`) {
        links[i].classList.add("selected");
      } else {
        links[i].classList.remove("selected");
      }
    }
  }
}
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.view.bindClearCompleted(this.handleClearCompleted);
    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindFilterChanged(this.handleFilters);
    this.view.bindEditTodo(this.handleEditTodo);
    this.view.bindToggleAll(this.handleToggleAll);

    this.onTodoListChanged(this.model.todos);
  }
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
    this.view.updateFooter(this.model.todos);
  };
  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText);
  };
  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };
  handleToggleTodo = (id) => {
    this.model.toggleTodo(id);
  };
  handleClearCompleted = () => {
    this.model.clearCompleted();
  };
  handleFilters = (filter) => {
    this.onTodoListChanged(this.model.todos);
  };
  handleEditTodo = (id, text) => {
    this.model.editTodo(id, text);
  };
  handleToggleAll = (state) => {
    this.model.toggleAll(state);
  };
}

const app = new Controller(new TodoModel(), new View());
