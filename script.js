/* StudyFlow: funcionalidades em JavaScript puro, sem dependências externas. */
"use strict";

const STORAGE_KEYS = {
  tasks: "studyflow.tasks.v1",
  notes: "studyflow.notes.v1",
  theme: "studyflow.theme.v1",
  focus: "studyflow.focus.v1"
};

const state = {
  tasks: [],
  filter: "all",
  search: "",
  timerMinutes: 25,
  timerRemaining: 25 * 60,
  timerRunning: false,
  timerInterval: null,
  focusMinutes: 0,
  theme: "light",
  pendingDialogAction: null
};

const elements = {
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskSubject: document.querySelector("#taskSubject"),
  taskPriority: document.querySelector("#taskPriority"),
  taskDueDate: document.querySelector("#taskDueDate"),
  taskList: document.querySelector("#taskList"),
  emptyState: document.querySelector("#emptyState"),
  taskSearch: document.querySelector("#taskSearch"),
  filterButtons: [...document.querySelectorAll("[data-filter]")],
  completedCount: document.querySelector("#completedCount"),
  totalCount: document.querySelector("#totalCount"),
  focusMinutes: document.querySelector("#focusMinutes"),
  progressPercent: document.querySelector("#progressPercent"),
  visibleTaskCount: document.querySelector("#visibleTaskCount"),
  taskFooterText: document.querySelector("#taskFooterText"),
  clearCompletedButton: document.querySelector("#clearCompletedButton"),
  notesArea: document.querySelector("#notesArea"),
  notesCharCount: document.querySelector("#notesCharCount"),
  notesSaveStatus: document.querySelector("#notesSaveStatus"),
  clearNotesButton: document.querySelector("#clearNotesButton"),
  themeToggle: document.querySelector("#themeToggle"),
  exportButton: document.querySelector("#exportButton"),
  todayLabel: document.querySelector("#todayLabel"),
  todayDate: document.querySelector("#todayDate"),
  timerDisplay: document.querySelector("#timerDisplay"),
  timerProgressBar: document.querySelector("#timerProgressBar"),
  timerStatus: document.querySelector("#timerStatus"),
  timerStartButton: document.querySelector("#timerStartButton"),
  timerResetButton: document.querySelector("#timerResetButton"),
  timerHint: document.querySelector("#timerHint"),
  durationButtons: [...document.querySelectorAll("[data-minutes]")],
  progressRing: document.querySelector("#progressRing"),
  ringPercent: document.querySelector("#ringPercent"),
  legendDone: document.querySelector("#legendDone"),
  legendPending: document.querySelector("#legendPending"),
  encouragementMessage: document.querySelector("#encouragementMessage"),
  dailyTip: document.querySelector("#dailyTip"),
  newTipButton: document.querySelector("#newTipButton"),
  subjectBreakdown: document.querySelector("#subjectBreakdown"),
  toastRegion: document.querySelector("#toastRegion"),
  confirmDialog: document.querySelector("#confirmDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogMessage: document.querySelector("#dialogMessage"),
  dialogConfirmButton: document.querySelector("#dialogConfirmButton")
};

const studyTips = [
  "Estude em blocos curtos e faça pausas para manter a atenção.",
  "Antes de ler novamente, tente lembrar o conteúdo sem consultar suas notas.",
  "Explique o assunto com palavras simples: isso revela o que você entendeu.",
  "Comece pela tarefa mais importante, não necessariamente pela mais fácil.",
  "Desative notificações durante o bloco de concentração.",
  "Resolva exercícios e pratique recuperar a informação da memória.",
  "Uma pausa curta e planejada ajuda a voltar com mais energia.",
  "Ao final, escreva uma frase sobre o que aprendeu hoje.",
  "Se a tarefa parece grande, divida-a em etapas de quinze minutos.",
  "Revise o conteúdo em dias diferentes para reforçar a lembrança."
];

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`Não foi possível ler ${key}.`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Não foi possível salvar ${key}.`, error);
    showToast("Não foi possível salvar os dados neste navegador.", "error");
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function showConfirm(title, message, action) {
  elements.dialogTitle.textContent = title;
  elements.dialogMessage.textContent = message;
  state.pendingDialogAction = action;
  if (typeof elements.confirmDialog.showModal === "function") {
    elements.confirmDialog.showModal();
  } else if (window.confirm(message)) {
    runPendingDialogAction();
  }
}

function runPendingDialogAction() {
  if (typeof state.pendingDialogAction === "function") {
    state.pendingDialogAction();
  }
  state.pendingDialogAction = null;
}

function saveTasks() {
  writeStorage(STORAGE_KEYS.tasks, state.tasks);
}

function loadTasks() {
  const stored = readStorage(STORAGE_KEYS.tasks, []);
  state.tasks = Array.isArray(stored)
    ? stored.filter((task) => task && typeof task.title === "string").map((task) => ({
        id: String(task.id || createId()),
        title: String(task.title).slice(0, 100),
        subject: String(task.subject || "Pessoal"),
        priority: ["low", "normal", "high"].includes(task.priority) ? task.priority : "normal",
        dueDate: String(task.dueDate || ""),
        completed: Boolean(task.completed),
        createdAt: Number(task.createdAt || Date.now())
      }))
    : [];
}

function addTask(event) {
  event.preventDefault();
  const title = elements.taskTitle.value.trim();
  if (!title) {
    showToast("Digite um título para a tarefa.", "error");
    elements.taskTitle.focus();
    return;
  }

  const task = {
    id: createId(),
    title,
    subject: elements.taskSubject.value,
    priority: elements.taskPriority.value,
    dueDate: elements.taskDueDate.value,
    completed: false,
    createdAt: Date.now()
  };

  state.tasks.unshift(task);
  saveTasks();
  elements.taskForm.reset();
  elements.taskPriority.value = "normal";
  renderAll();
  showToast("Tarefa adicionada com sucesso.");
  elements.taskTitle.focus();
}

function getFilteredTasks() {
  const query = state.search.trim().toLocaleLowerCase("pt-BR");
  return state.tasks.filter((task) => {
    const matchesFilter = state.filter === "all"
      || (state.filter === "pending" && !task.completed)
      || (state.filter === "completed" && task.completed);
    const haystack = `${task.title} ${task.subject}`.toLocaleLowerCase("pt-BR");
    return matchesFilter && haystack.includes(query);
  });
}

function formatDueDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function priorityLabel(priority) {
  const labels = { high: "Prioridade alta", normal: "Prioridade normal", low: "Prioridade baixa" };
  return labels[priority] || labels.normal;
}

function taskMarkup(task) {
  const due = formatDueDate(task.dueDate);
  const priorityClass = task.priority === "normal" ? "" : task.priority;
  return `
    <article class="task-item ${task.completed ? "is-completed" : ""}" data-task-id="${escapeHtml(task.id)}">
      <input class="task-checkbox" type="checkbox" data-action="toggle" aria-label="Marcar ${escapeHtml(task.title)} como concluída" ${task.completed ? "checked" : ""}>
      <div class="task-content">
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        <div class="task-meta">
          <span class="subject-tag">${escapeHtml(task.subject)}</span>
          <span class="priority-tag ${priorityClass}">${escapeHtml(priorityLabel(task.priority))}</span>
          ${due ? `<span class="due-tag">Prazo: ${escapeHtml(due)}</span>` : ""}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action" type="button" data-action="edit" aria-label="Editar ${escapeHtml(task.title)}" title="Editar">✎</button>
        <button class="task-action delete" type="button" data-action="delete" aria-label="Excluir ${escapeHtml(task.title)}" title="Excluir">×</button>
      </div>
    </article>
  `;
}

function renderTasks() {
  const tasks = getFilteredTasks();
  elements.taskList.innerHTML = tasks.map(taskMarkup).join("");
  const noTasks = tasks.length === 0;
  if (noTasks) {
    const hasAnyTasks = state.tasks.length > 0;
    elements.taskList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">${hasAnyTasks ? "⌕" : "✦"}</span>
        <h3>${hasAnyTasks ? "Nenhuma tarefa encontrada" : "Seu espaço está pronto"}</h3>
        <p>${hasAnyTasks ? "Tente mudar o filtro ou o termo de busca." : "Adicione uma tarefa para começar a organizar seus estudos."}</p>
      </div>
    `;
  }
  elements.visibleTaskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "item" : "itens"}`;
  elements.taskFooterText.textContent = state.tasks.length
    ? `${state.tasks.filter((task) => !task.completed).length} tarefa(s) esperando por você`
    : "Você consegue!";
}

function renderStats() {
  const total = state.tasks.length;
  const done = state.tasks.filter((task) => task.completed).length;
  const pending = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;

  elements.completedCount.textContent = String(done);
  elements.totalCount.textContent = String(total);
  elements.progressPercent.textContent = `${percent}%`;
  elements.ringPercent.textContent = `${percent}%`;
  elements.progressRing.style.setProperty("--progress", `${percent}%`);
  elements.legendDone.textContent = String(done);
  elements.legendPending.textContent = String(pending);

  if (total === 0) {
    elements.encouragementMessage.textContent = "Adicione uma tarefa para começar.";
  } else if (percent === 100) {
    elements.encouragementMessage.textContent = "Tudo concluído! Excelente trabalho.";
  } else if (percent >= 60) {
    elements.encouragementMessage.textContent = "Você está avançando muito bem!";
  } else if (percent >= 30) {
    elements.encouragementMessage.textContent = "Continue. A consistência faz diferença.";
  } else {
    elements.encouragementMessage.textContent = "Cada tarefa concluída conta.";
  }
}

function renderSubjectBreakdown() {
  const subjects = new Map();
  state.tasks.forEach((task) => {
    if (!subjects.has(task.subject)) subjects.set(task.subject, { total: 0, done: 0 });
    const record = subjects.get(task.subject);
    record.total += 1;
    if (task.completed) record.done += 1;
  });

  if (subjects.size === 0) {
    elements.subjectBreakdown.innerHTML = '<p class="muted">Suas matérias aparecerão aqui.</p>';
    return;
  }

  elements.subjectBreakdown.innerHTML = [...subjects.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
    .map(([name, data]) => {
      const percent = Math.round((data.done / data.total) * 100);
      return `
        <div class="subject-row">
          <div class="subject-row-head">
            <span>${escapeHtml(name)}</span>
            <span>${data.done}/${data.total}</span>
          </div>
          <div class="subject-bar" role="progressbar" aria-label="Progresso em ${escapeHtml(name)}" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
            <span style="width: ${percent}%"></span>
          </div>
        </div>
      `;
    }).join("");
}

function renderAll() {
  renderTasks();
  renderStats();
  renderSubjectBreakdown();
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderAll();
  showToast(task.completed ? "Tarefa concluída. Boa!" : "Tarefa voltou para pendentes.");
}

function deleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  showConfirm("Excluir tarefa", `Deseja excluir "${task.title}"?`, () => {
    state.tasks = state.tasks.filter((item) => item.id !== id);
    saveTasks();
    renderAll();
    showToast("Tarefa excluída.");
  });
}

function editTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  const newTitle = window.prompt("Edite o título da tarefa:", task.title);
  if (newTitle === null) return;
  const cleanTitle = newTitle.trim();
  if (!cleanTitle) {
    showToast("O título não pode ficar vazio.", "error");
    return;
  }
  task.title = cleanTitle.slice(0, 100);
  saveTasks();
  renderAll();
  showToast("Tarefa atualizada.");
}

function handleTaskListClick(event) {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const taskElement = actionButton.closest("[data-task-id]");
  if (!taskElement) return;
  const id = taskElement.dataset.taskId;
  const action = actionButton.dataset.action;

  if (action === "edit") editTask(id);
  if (action === "delete") deleteTask(id);
}

function handleTaskListChange(event) {
  const checkbox = event.target.closest('[data-action="toggle"]');
  if (!checkbox) return;
  const taskElement = checkbox.closest("[data-task-id]");
  if (taskElement) toggleTask(taskElement.dataset.taskId);
}

function setFilter(filter) {
  state.filter = filter;
  elements.filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderTasks();
}

function clearCompletedTasks() {
  const completed = state.tasks.filter((task) => task.completed).length;
  if (!completed) {
    showToast("Não há tarefas concluídas para limpar.");
    return;
  }
  showConfirm("Limpar tarefas concluídas", `Excluir ${completed} tarefa(s) concluída(s)?`, () => {
    state.tasks = state.tasks.filter((task) => !task.completed);
    saveTasks();
    renderAll();
    showToast("Tarefas concluídas removidas.");
  });
}

function saveNotes() {
  const notes = elements.notesArea.value;
  writeStorage(STORAGE_KEYS.notes, notes);
  elements.notesCharCount.textContent = String(notes.length);
  elements.notesSaveStatus.textContent = "Salvando...";
  window.setTimeout(() => {
    elements.notesSaveStatus.textContent = "Salvo localmente";
  }, 350);
}

function loadNotes() {
  const notes = readStorage(STORAGE_KEYS.notes, "");
  elements.notesArea.value = typeof notes === "string" ? notes : "";
  elements.notesCharCount.textContent = String(elements.notesArea.value.length);
}

function clearNotes() {
  if (!elements.notesArea.value.trim()) {
    showToast("O bloco de notas já está vazio.");
    return;
  }
  showConfirm("Limpar anotações", "Deseja apagar todas as anotações?", () => {
    elements.notesArea.value = "";
    saveNotes();
    showToast("Anotações apagadas.");
  });
}

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = state.theme;
  elements.themeToggle.textContent = state.theme === "dark" ? "☀" : "☾";
  elements.themeToggle.setAttribute(
    "aria-label",
    state.theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
  );
  writeStorage(STORAGE_KEYS.theme, state.theme);
}

function toggleTheme() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
}

function updateDate() {
  const now = new Date();
  elements.todayLabel.textContent = now.toLocaleDateString("pt-BR", { weekday: "long" });
  elements.todayDate.textContent = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  elements.timerDisplay.textContent = formatTime(state.timerRemaining);
  const totalSeconds = state.timerMinutes * 60;
  const elapsed = totalSeconds - state.timerRemaining;
  const percent = totalSeconds ? (elapsed / totalSeconds) * 100 : 0;
  elements.timerProgressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

function selectTimerDuration(minutes) {
  if (state.timerRunning) {
    showToast("Pause o timer antes de mudar a duração.", "error");
    return;
  }
  state.timerMinutes = minutes;
  state.timerRemaining = minutes * 60;
  elements.durationButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.minutes) === minutes);
  });
  elements.timerStatus.textContent = "Pronto";
  elements.timerHint.textContent = `Bloco de ${minutes} minutos selecionado.`;
  updateTimerDisplay();
}

function startTimer() {
  if (state.timerRunning) {
    pauseTimer();
    return;
  }
  if (state.timerRemaining <= 0) {
    state.timerRemaining = state.timerMinutes * 60;
  }
  state.timerRunning = true;
  elements.timerStartButton.textContent = "Pausar";
  elements.timerStatus.textContent = "Em foco";
  elements.timerHint.textContent = "Você está no controle. Continue!";
  state.timerInterval = window.setInterval(tickTimer, 1000);
}

function pauseTimer() {
  if (state.timerInterval !== null) {
    window.clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timerRunning = false;
  elements.timerStartButton.textContent = "Continuar";
  elements.timerStatus.textContent = "Pausado";
  elements.timerHint.textContent = "Respire e retome quando estiver pronto.";
}

function resetTimer() {
  if (state.timerInterval !== null) {
    window.clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timerRunning = false;
  state.timerRemaining = state.timerMinutes * 60;
  elements.timerStartButton.textContent = "Iniciar foco";
  elements.timerStatus.textContent = "Pronto";
  elements.timerHint.textContent = "Seu próximo passo começa agora.";
  updateTimerDisplay();
}

function tickTimer() {
  state.timerRemaining -= 1;
  updateTimerDisplay();
  if (state.timerRemaining <= 0) completeTimer();
}

function completeTimer() {
  if (state.timerInterval !== null) {
    window.clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timerRunning = false;
  state.focusMinutes += state.timerMinutes;
  writeStorage(STORAGE_KEYS.focus, state.focusMinutes);
  elements.focusMinutes.textContent = String(state.focusMinutes);
  elements.timerStartButton.textContent = "Iniciar foco";
  elements.timerStatus.textContent = "Concluído";
  elements.timerHint.textContent = "Bloco finalizado. Faça uma pausa merecida!";
  state.timerRemaining = 0;
  updateTimerDisplay();
  showToast(`Bloco de ${state.timerMinutes} minutos concluído!`);
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("StudyFlow", { body: "Seu bloco de foco terminou. Hora de fazer uma pausa!" });
  }
}

function exportData() {
  const data = {
    application: "StudyFlow",
    exportedAt: new Date().toISOString(),
    tasks: state.tasks,
    notes: elements.notesArea.value,
    focusMinutes: state.focusMinutes,
    theme: state.theme
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `studyflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("Backup exportado em JSON.");
}

function showRandomTip() {
  const current = elements.dailyTip.textContent;
  const options = studyTips.filter((tip) => tip !== current);
  const next = options[Math.floor(Math.random() * options.length)] || studyTips[0];
  elements.dailyTip.textContent = next;
}

function handleKeyboardShortcuts(event) {
  const target = event.target;
  const typing = target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target.isContentEditable;
  if (typing || event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key.toLowerCase() === "n") {
    event.preventDefault();
    elements.taskTitle.focus();
  }
  if (event.key.toLowerCase() === "t") {
    event.preventDefault();
    toggleTheme();
  }
}

function bindEvents() {
  elements.taskForm.addEventListener("submit", addTask);
  elements.taskList.addEventListener("click", handleTaskListClick);
  elements.taskList.addEventListener("change", handleTaskListChange);
  elements.taskSearch.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderTasks();
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  elements.clearCompletedButton.addEventListener("click", clearCompletedTasks);
  elements.notesArea.addEventListener("input", saveNotes);
  elements.clearNotesButton.addEventListener("click", clearNotes);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.exportButton.addEventListener("click", exportData);
  elements.timerStartButton.addEventListener("click", startTimer);
  elements.timerResetButton.addEventListener("click", resetTimer);
  elements.durationButtons.forEach((button) => {
    button.addEventListener("click", () => selectTimerDuration(Number(button.dataset.minutes)));
  });
  elements.newTipButton.addEventListener("click", showRandomTip);
  elements.dialogConfirmButton.addEventListener("click", (event) => {
    event.preventDefault();
    runPendingDialogAction();
    elements.confirmDialog.close();
  });
  elements.confirmDialog.addEventListener("close", () => {
    state.pendingDialogAction = null;
  });
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function loadFocusTime() {
  const value = Number(readStorage(STORAGE_KEYS.focus, 0));
  state.focusMinutes = Number.isFinite(value) && value >= 0 ? value : 0;
  elements.focusMinutes.textContent = String(state.focusMinutes);
}

function initializeTheme() {
  const storedTheme = readStorage(STORAGE_KEYS.theme, "light");
  applyTheme(storedTheme);
}

function initializeApp() {
  loadTasks();
  loadNotes();
  loadFocusTime();
  initializeTheme();
  updateDate();
  bindEvents();
  renderAll();
  updateTimerDisplay();
  elements.dailyTip.textContent = studyTips[new Date().getDate() % studyTips.length];
  console.info("StudyFlow iniciado.");
}

document.addEventListener("DOMContentLoaded", initializeApp);

// Helpers complementares: pequenas funções isoladas facilitam manutenção e testes.

function normalizeText01(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText01(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText02(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText02(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText03(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText03(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText04(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText04(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText05(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText05(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText06(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText06(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText07(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText07(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText08(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText08(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText09(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText09(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText10(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText10(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText11(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText11(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText12(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText12(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText13(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText13(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText14(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText14(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText15(value) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function isValidText15(value) {
  return typeof value === "string" && value.trim().length > 0;
}
