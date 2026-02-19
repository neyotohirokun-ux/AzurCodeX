import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import "./Tools.css";

type ToolView = "add" | "edit" | "delete";

export function Tools() {
  const [active, setActive] = useState<ToolView>("add");

  return (
    <div className="tools-container">
      {/* Sidebar */}
      <aside className="tools-sidebar">
        <button
          className={`tools-btn ${active === "add" ? "active" : ""}`}
          onClick={() => setActive("add")}
        >
          <Plus />
          Add
        </button>

        <button
          className={`tools-btn ${active === "edit" ? "active" : ""}`}
          onClick={() => setActive("edit")}
        >
          <Pencil />
          Edit
        </button>

        <button
          className={`tools-btn ${active === "delete" ? "active" : ""}`}
          onClick={() => setActive("delete")}
        >
          <Trash />
          Delete
        </button>
      </aside>

      {/* Main Content */}
      <main className="tools-main">
        {active === "add" && <h2> Add Content Area</h2>}
        {active === "edit" && <h2>Edit Content Area</h2>}
        {active === "delete" && <h2>Delete Content Area</h2>}
      </main>
    </div>
  );
}
