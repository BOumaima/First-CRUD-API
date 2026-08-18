const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const app = express();
const port = 3000;

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

const tasks = [
    { id: 1, title: "Learn Express basics", done: true },
    { id: 2, title: "Build the Task API", done: false },
    { id: 3, title: "Read a book", done: true },
]

app.get('/', (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"],
    });
});

app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found` });
    }

    res.json(task);
});

app.post('/tasks', (req, res) => {
    const { title } = req.body;

    if (typeof title !== 'string') {
        return res.status(400).json({
            error: 'title must be a string'
        });
    }

    if (title.trim() === '') {
        return res.status(400).json({
            error: 'title is required and cannot be empty'
        });
    }

    const id = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
    const task = { id, title: title.trim(), done: false };

    tasks.push(task);
    res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found` });
    }

    const { title, done } = req.body ?? {};
    const hasTitle = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'title');
    const hasDone = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'done');

    if (!hasTitle && !hasDone) {
        return res.status(400).json({ error: 'request body must include title and/or done' });
    }

    if (hasTitle) {
        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'title must be a non-empty string' });
        }
        task.title = title.trim();
    }

    if (hasDone) {
        if (typeof done !== 'boolean') {
            return res.status(400).json({ error: 'done must be a boolean' });
        }
        task.done = done;
    }

    res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: `Task ${id} not found` });
    }

    tasks.splice(index, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`CRUD API listening on port ${port}`);
});