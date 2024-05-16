// Model
class TodoModel {
  constructor() {
    // Fetch Saved TODOS From Local Storage
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

  // Register a callback to be invoked when the todo list changes
  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  // Commit the todos to localStorage and invoke the change callback
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

    // Clear the current list of todos
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    // Display filtered todos
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
  // Update Footer & Items Count
  updateFooter(todos) {
    const footer = this.getElement(".opt-footer");

    if (todos.length > 0) {
      footer.style.display = "flex";
      const todoCount = this.getElement(".todo-count span");
      todoCount.textContent = todos.filter((todo) => !todo.done).length;
    } else {
      footer.style.display = "none";
    }

    // Update clear completed button visibility
    const completed = todos.filter((todo) => todo.done);
    this.clearCompleted.textContent = completed.length > 0 ? "Clear Completed" : "";
  }

  // Bind the "add todo" action to the input events
  bindAddTodo(handler) {
    this.input.addEventListener("keyup", ({ key }) => {
      if (key === "Enter" && this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
    this.input.addEventListener("blur", () => {
      if (this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }

  // Bind the "delete todo" action to the destroy button
  bindDeleteTodo(handler) {
    this.todoList.addEventListener("click", (event) => {
      if (event.target.className === "destroy") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  // Bind the "clear completed" action to the clear completed button
  bindClearCompleted(handler) {
    this.clearCompleted.addEventListener("click", handler);
  }

  // Bind the "toggle todo" action to the checkbox change event
  bindToggleTodo(handler) {
    this.todoList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  // Bind the "edit todo" action to the double-click event on the label
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
      }
    });
  }

  // Bind the "filter change" action to the filter elements
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

    window.onhashchange = () => {
      const urlList = window.location.hash.split("/");
      const filter = urlList[urlList.length - 1];
      handler(filter);
    };
  }

  // Bind the "toggle all todos" action to the toggle all checkbox
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

    // Bind view events to handler methods
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.view.bindClearCompleted(this.handleClearCompleted);
    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindFilterChanged(this.handleFilters);
    this.view.bindEditTodo(this.handleEditTodo);
    this.view.bindToggleAll(this.handleToggleAll);

    // Initial display of todos
    this.onTodoListChanged(this.model.todos);
  }

  // Update view when the todo list changes
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
    this.view.updateFooter(this.model.todos);
  };
  // Handlers
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
    if (text) {
      this.model.editTodo(id, text);
    } else {
      this.handleDeleteTodo(id);
    }
  };

  handleToggleAll = (state) => {
    this.model.toggleAll(state);
  };
}

// Initialize the app with the model and view
const app = new Controller(new TodoModel(), new View());
