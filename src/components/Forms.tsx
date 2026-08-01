import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { FormState } from "../lib/types";

type FormKind = "contact" | "support";

type FormConfig = {
  endpoint: string;
  fields: Array<{ name: string; label: string; type?: string; placeholder: string; textarea?: boolean }>;
};

const configs: Record<FormKind, FormConfig> = {
  contact: {
    endpoint: "/api/contact",
    fields: [
      { name: "name", label: "Name", placeholder: "Your name" },
      { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
      { name: "message", label: "Message", placeholder: "How can we help?", textarea: true },
    ],
  },
  support: {
    endpoint: "/api/support",
    fields: [
      { name: "name", label: "Name", placeholder: "Your name" },
      { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
      { name: "product", label: "Product or site", placeholder: "e.g. Disco Media site" },
      { name: "message", label: "Message", placeholder: "Please describe your issue or question...", textarea: true },
    ],
  },
};

export function ContactSupportForm({ kind }: { kind: FormKind }) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const config = configs[kind];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to send message.");
      form.reset();
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
      setState("error");
    }
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      {config.fields.map((field) => (
        <label className="grid gap-2 text-sm font-bold text-slate-950" key={field.name}>
          {field.label}
          {field.textarea ? (
            <textarea
              className="focus-ring min-h-40 resize-y border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400"
              name={field.name}
              placeholder={field.placeholder}
              required
            />
          ) : (
            <input
              className="focus-ring min-h-12 border border-slate-300 bg-white px-4 text-base font-medium text-slate-950 placeholder:text-slate-400"
              name={field.name}
              placeholder={field.placeholder}
              required
              type={field.type ?? "text"}
            />
          )}
        </label>
      ))}
      <button
        className="focus-ring inline-flex min-h-12 w-fit items-center justify-center gap-2 bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state === "submitting"}
        type="submit"
      >
        <Send className="h-4 w-4" />
        {state === "submitting" ? "Sending..." : "Send"}
      </button>
      {state === "success" && (
        <p className="border border-green-300 bg-green-50 px-4 py-4 text-sm font-semibold text-green-800">
          Message sent. Thanks for reaching out. We'll get back to you soon.
        </p>
      )}
      {state === "error" && (
        <p className="border border-red-300 bg-red-50 px-4 py-4 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
    </form>
  );
}
