const KEY = "it-support-demo-v1";

const startingRecords = [
  { id: 1, title: "Cannot connect to campus Wi-Fi", category: "Network", description: "My laptop cannot connect to the university wireless network.", status: "Pending" },
  { id: 2, title: "Printer not responding", category: "Hardware", description: "The library printer does not respond when a document is sent.", status: "In progress" },
  { id: 3, title: "Word processor crashes", category: "Software", description: "The word processing application closes unexpectedly.", status: "Pending" },
  { id: 4, title: "Keyboard keys not working", category: "Hardware", description: "Several keys on the lab computer keyboard do not work.", status: "Completed" },
  { id: 5, title: "Slow internet connection", category: "Network", description: "Internet access in the study room is unusually slow.", status: "In progress" },
  { id: 6, title: "Browser update problem", category: "Software", description: "The browser reports an error when checking for updates.", status: "Pending" },
  { id: 7, title: "Monitor display flickers", category: "Hardware", description: "The desktop monitor flickers during normal use.", status: "Completed" },
  { id: 8, title: "Unable to access student portal", category: "Network", description: "The student portal page does not load on the campus network.", status: "Pending" }
];

function readRecords() {
  const saved = localStorage.getItem(KEY);
  if (saved === null) {
    localStorage.setItem(KEY, JSON.stringify(startingRecords));
    return [...startingRecords];
  }
  try {
    const records = JSON.parse(saved);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function writeRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export const recordService = {
  async list() {
    return readRecords();
  },

  async get(id) {
    const record = readRecords().find(item => item.id === Number(id));
    if (!record) throw new Error("That record could not be found.");
    return record;
  },

  async create(record) {
    const records = readRecords();
    const nextId = records.length ? Math.max(...records.map(item => Number(item.id) || 0)) + 1 : 1;
    const newRecord = { id: nextId, title: record.title, category: record.category, description: record.description, status: record.status };
    records.push(newRecord);
    writeRecords(records);
    return newRecord;
  },

  async update(id, record) {
    const records = readRecords();
    const index = records.findIndex(item => item.id === Number(id));
    if (index === -1) throw new Error("That record could not be found.");
    records[index] = { id: records[index].id, title: record.title, category: record.category, description: record.description, status: record.status };
    writeRecords(records);
    return records[index];
  },

  async remove(id) {
    const records = readRecords();
    const remaining = records.filter(item => item.id !== Number(id));
    if (remaining.length === records.length) throw new Error("That record could not be found.");
    writeRecords(remaining);
    return "Record deleted successfully.";
  }
};
