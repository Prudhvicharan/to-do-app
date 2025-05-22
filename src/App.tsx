import React, { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Modal,
  Dropdown,
  Checkbox,
  DatePicker,
  Badge,
  PriorityBadge,
  StatusBadge,
  TagBadge,
  CountBadge,
  Card,
  TaskCard,
  IconButton,
  EditIconButton,
  DeleteIconButton,
  AddIconButton,
} from "./components/ui";
import "./App.css";

export default function App() {
  // Test states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [dropdownValue, setDropdownValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Build awesome todo app",
      description: "Create a modern todo app with React and TypeScript",
      completed: false,
      priority: "high" as const,
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      tags: ["React", "TypeScript"],
    },
    {
      id: "2",
      title: "Test UI components",
      description: "Make sure all components work correctly",
      completed: true,
      priority: "medium" as const,
      dueDate: new Date(),
      tags: ["Testing", "UI"],
    },
    {
      id: "3",
      title: "Write documentation",
      description: "",
      completed: false,
      priority: "low" as const,
      dueDate: new Date(Date.now() - 86400000), // Yesterday (overdue)
      tags: ["Docs"],
    },
  ]);

  // Dropdown options
  const priorityOptions = [
    { value: "high", label: "High Priority", icon: "🔴" },
    { value: "medium", label: "Medium Priority", icon: "🟡" },
    { value: "low", label: "Low Priority", icon: "🟢" },
  ];

  // Handlers
  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 UI Components Test Playground</h1>

      {/* Buttons Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Buttons</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button isLoading>Loading...</Button>
          <Button leftIcon="📝">With Icon</Button>
        </div>
      </section>

      {/* Icon Buttons Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Icon Buttons</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <AddIconButton tooltip="Add new task" />
          <EditIconButton tooltip="Edit" variant="ghost" />
          <DeleteIconButton tooltip="Delete" variant="ghost" />
          <IconButton
            icon="❤️"
            aria-label="Like"
            variant="ghost"
            tooltip="Like this"
          />
          <IconButton
            icon="⭐"
            aria-label="Favorite"
            variant="outline"
            tooltip="Add to favorites"
          />
        </div>
      </section>

      {/* Inputs Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Inputs</h2>
        <div style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}>
          <Input
            label="Task Title"
            placeholder="Enter task title"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            leftIcon="📝"
          />

          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            variant="filled"
            rightIcon="@"
          />

          <Input
            label="With Error"
            placeholder="This has an error"
            errorMessage="This field is required"
            variant="outline"
          />

          <Textarea
            label="Task Description"
            placeholder="Describe your task..."
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            rows={3}
          />
        </div>
      </section>

      {/* Dropdown & Date Picker */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Dropdowns & Date Picker</h2>
        <div style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}>
          <Dropdown
            label="Priority"
            options={priorityOptions}
            placeholder="Select priority"
            value={dropdownValue}
            onSelect={(value) => setDropdownValue(value)}
            isSearchable
          />

          <DatePicker
            label="Due Date"
            placeholder="Select due date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>
      </section>

      {/* Checkboxes */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Checkboxes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Checkbox
            label="Mark as completed"
            description="This will mark the task as done"
            checked={checkboxValue}
            onChange={(e) => setCheckboxValue(e.target.checked)}
          />

          <Checkbox label="Send notifications" checked={true} size="lg" />

          <Checkbox label="Indeterminate state" isIndeterminate={true} />
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Badges</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <PriorityBadge priority="high" />
          <PriorityBadge priority="medium" />
          <PriorityBadge priority="low" />

          <StatusBadge status="todo" />
          <StatusBadge status="in_progress" />
          <StatusBadge status="completed" />

          <TagBadge tag="React" color="blue" />
          <TagBadge tag="TypeScript" color="purple" />

          <CountBadge count={5} />
          <CountBadge count={120} max={99} />

          <Badge variant="success">New</Badge>
          <Badge variant="warning">Beta</Badge>
          <Badge variant="danger">Urgent</Badge>
        </div>
      </section>

      {/* Cards */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Cards</h2>

        {/* Basic Card */}
        {/* <Card
          variant="outlined"
          style={{ marginBottom: "1rem", maxWidth: "400px" }}
        >
          <Card.Header divider>
            <h3 style={{ margin: 0 }}>Basic Card</h3>
          </Card.Header>
          <Card.Body>
            <p>This is a basic card with header and body content.</p>
          </Card.Body>
          <Card.Footer justify="end">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </Card.Footer>
        </Card> */}

        {/* Task Cards */}
        <div style={{ display: "grid", gap: "1rem", maxWidth: "600px" }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleTask}
              onEdit={(id) => console.log("Edit task:", id)}
              onDelete={deleteTask}
            />
          ))}
        </div>
      </section>

      {/* Modal Test */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

        {/* <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Task"
          size="md"
        >
          <Modal.Body>
            <div style={{ display: "grid", gap: "1rem" }}>
              <Input label="Title" placeholder="Task title" />
              <Textarea
                label="Description"
                placeholder="Task description"
                rows={3}
              />
              <Dropdown
                label="Priority"
                options={priorityOptions}
                placeholder="Select priority"
                onSelect={() => {}}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Create Task</Button>
          </Modal.Footer>
        </Modal> */}
      </section>

      {/* Theme Toggle */}
      <section>
        <h2>Theme Toggle</h2>
        <Button
          onClick={() => {
            const currentTheme =
              document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
          }}
          variant="outline"
        >
          Toggle Dark/Light Theme
        </Button>
      </section>
    </div>
  );
}
