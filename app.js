import { recordService } from "./data.js";

const form = document.querySelector("#record-form");
const titleInput = document.querySelector("#title");
const categoryInput = document.querySelector("#category");
const descriptionInput = document.querySelector("#description");
const statusInput = document.querySelector("#status");
const idInput = document.querySelector("#record-id");
const list = document.querySelector("#record-list");
const message = document.querySelector("#message");
const count = document.querySelector("#record-count");
const searchInput = document.querySelector("#search");
const filterInput = document.querySelector("#status-filter");
const cancelButton = document.querySelector("#cancel-edit");
const formHeading = document.querySelector("#form-heading");
const saveButton = document.querySelector("#save-button");

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function clearForm() {
  form.reset();
  idInput.value = "";
  formHeading.textContent = "Add a support request";
  saveButton.textContent = "Save request";
  cancelButton.hidden = true;
}

function validateRecord(record) {
  if (record.title.length < 3 || record.title.length > 80) return "Title must contain 3 to 80 characters.";
  if (record.category.length < 2 || record.category.length > 40) return "Category must contain 2 to 40 characters.";
  if (record.description.length < 5 || record.description.length > 300) return "Description must contain 5 to 300 characters.";
  if (!["Pending", "In progress", "Completed"].includes(record.status)) return "Choose a valid status.";
  return "";
}

function makeTextElement(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function makeAction(label, className, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = `small ${className}`;
  button.addEventListener("click", handler);
  return button;
}

async function renderRecords() {
  const records = await recordService.list();
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = filterInput.value;
  const displayed = records.filter(record => {
    const matchesTitle = record.title.toLowerCase().includes(searchTerm);
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    return matchesTitle && matchesStatus;
  });

  count.textContent = `${displayed.length} of ${records.length} records`;
  list.replaceChildren();

  if (displayed.length === 0) {
    list.append(makeTextElement("p", "No records match your search or filter.", "empty"));
    return;
  }

  displayed.forEach(record => {
    const card = document.createElement("article");
    card.className = "record-card";
    card.append(makeTextElement("h3", record.title));
    card.append(makeTextElement("p", `ID: ${record.id}`));
    card.append(makeTextElement("p", `Category: ${record.category}`));
    card.append(makeTextElement("p", record.description));
    card.append(makeTextElement("span", record.status, "status"));

    const actions = document.createElement("div");
    actions.className = "record-actions";
    actions.append(makeAction("View", "secondary", async () => {
      try {
        const fullRecord = await recordService.get(record.id);
        alert(`ID: ${fullRecord.id}\nTitle: ${fullRecord.title}\nCategory: ${fullRecord.category}\nDescription: ${fullRecord.description}\nStatus: ${fullRecord.status}`);
      } catch (error) { showMessage(error.message, "error"); }
    }));
    actions.append(makeAction("Edit", "secondary", () => startEdit(record)));
    actions.append(makeAction("Delete", "danger", async () => {
      if (!confirm(`Are you sure you want to delete "${record.title}"?`)) {
        showMessage("Deletion cancelled.", "success");
        return;
      }
      try {
        await recordService.remove(record.id);
        showMessage("Record deleted successfully.");
        await renderRecords();
      } catch (error) { showMessage(error.message, "error"); }
    }));
    card.append(actions);
    list.append(card);
  });
}

function startEdit(record) {
  idInput.value = record.id;
  titleInput.value = record.title;
  categoryInput.value = record.category;
  descriptionInput.value = record.description;
  statusInput.value = record.status;
  formHeading.textContent = `Edit request #${record.id}`;
  saveButton.textContent = "Update request";
  cancelButton.hidden = false;
  titleInput.focus();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const record = {
    title: titleInput.value.trim(),
    category: categoryInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: statusInput.value
  };

  const error = validateRecord(record);
  if (error) {
    showMessage(error, "error");
    return;
  }

  try {
    if (idInput.value) {
      await recordService.update(idInput.value, record);
      showMessage("Record updated successfully.");
    } else {
      await recordService.create(record);
      showMessage("Record added successfully.");
    }
    clearForm();
    await renderRecords();
  } catch (err) {
    showMessage(err.message, "error");
  }
});

cancelButton.addEventListener("click", () => {
  clearForm();
  showMessage("Edit cancelled.");
});

searchInput.addEventListener("input", renderRecords);
filterInput.addEventListener("change", renderRecords);

renderRecords().catch(error => showMessage(error.message, "error"));
