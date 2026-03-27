import type {
  AppFormDefinition,
  MiniAppRuntimePayload,
  ViewerState,
  ViewerStateController,
  ViewerStateListener,
} from "@agent-maurice/viewer-core";

type MockScenarioKey = "sales-cockpit" | "ops-review" | "support-center";

type ScenarioState = {
  selectedPrimary: string;
  selectedSecondary: string;
  note: string;
  version: number;
};

type ScenarioSpec = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryItems: string[];
  secondaryLabel: string;
  secondaryItems: string[];
  tableColumns: string[];
  rowsByPrimary: Record<string, Array<Record<string, string | number>>>;
  summaryByPrimary: Record<string, string>;
};

const FORMS: Record<string, AppFormDefinition> = {
  annotate_demo: {
    id: "annotate_demo",
    title: "Annotate the demo",
    fields: [
      {
        name: "comment",
        type: "textarea",
        description: "Free text used to update the demo context",
      },
    ],
  },
};

const SCENARIOS: Record<MockScenarioKey, ScenarioSpec> = {
  "sales-cockpit": {
    title: "Sales cockpit",
    subtitle: "Multi-embed without React, with KPIs, a segment list, and a deals table",
    primaryLabel: "Segments",
    primaryItems: ["Enterprise", "Mid-market", "SMB"],
    secondaryLabel: "Focus",
    secondaryItems: ["Pipeline", "Risk", "Renewal"],
    tableColumns: ["deal", "owner", "status", "amount"],
    rowsByPrimary: {
      Enterprise: [
        { deal: "Orange Expansion", owner: "Lucie", status: "In progress", amount: "2.4 M€" },
        { deal: "Global Telco", owner: "Marc", status: "At risk", amount: "1.2 M€" },
      ],
      "Mid-market": [
        { deal: "Retail Europe", owner: "Hugo", status: "New", amount: "420 k€" },
        { deal: "Cloud Partners", owner: "Sarah", status: "In progress", amount: "690 k€" },
      ],
      SMB: [
        { deal: "Starter Wave", owner: "Emma", status: "In progress", amount: "95 k€" },
        { deal: "SMB Renewals", owner: "Lina", status: "Validated", amount: "140 k€" },
      ],
    },
    summaryByPrimary: {
      Enterprise: "The Enterprise segment concentrates the highest pipeline volume and the quarter-end risks.",
      "Mid-market": "The Mid-market segment shows healthy momentum with several opportunities in advanced qualification.",
      SMB: "The SMB segment illustrates a lighter embed with lower volume and faster decisions.",
    },
  },
  "ops-review": {
    title: "Operations review",
    subtitle: "Tracking workspace with work queues, concise detail, and a comment form",
    primaryLabel: "Queues",
    primaryItems: ["Needs review", "Waiting", "Validated"],
    secondaryLabel: "Perspective",
    secondaryItems: ["Today", "This week", "This month"],
    tableColumns: ["run", "owner", "status", "priority"],
    rowsByPrimary: {
      "Needs review": [
        { run: "Partner validation", owner: "Camille", status: "Needs review", priority: "High" },
        { run: "Compliance block", owner: "Noah", status: "Blocked", priority: "Critical" },
      ],
      Waiting: [
        { run: "Document check", owner: "Yanis", status: "Waiting", priority: "Medium" },
        { run: "Vendor follow-up", owner: "Eva", status: "Waiting", priority: "Low" },
      ],
      Validated: [
        { run: "Morning review", owner: "Mila", status: "Validated", priority: "Low" },
        { run: "Express audit", owner: "Lea", status: "Validated", priority: "Medium" },
      ],
    },
    summaryByPrimary: {
      "Needs review": "This queue is well suited to demonstrate a reviewer mini-app with an actionable backlog.",
      Waiting: "The Waiting queue helps demonstrate an intermediate state and a more documentary embed.",
      Validated: "The Validated queue shows how to expose a calmer completion view in the same interface.",
    },
  },
  "support-center": {
    title: "Support control center",
    subtitle: "Incident and alert view with several embeds side by side on a static page",
    primaryLabel: "Alerts",
    primaryItems: ["Open", "Blocking", "Closed"],
    secondaryLabel: "Scope",
    secondaryItems: ["API", "SSO", "Webhooks"],
    tableColumns: ["incident", "owner", "severity", "sla"],
    rowsByPrimary: {
      Open: [
        { incident: "API latency spike", owner: "Nina", severity: "High", sla: "42 min" },
        { incident: "Webhook backlog", owner: "Rayan", severity: "Medium", sla: "1h12" },
      ],
      Blocking: [
        { incident: "SSO callback failures", owner: "Zoe", severity: "Critical", sla: "Breach" },
        { incident: "Billing sync timeout", owner: "Leo", severity: "High", sla: "18 min" },
      ],
      Closed: [
        { incident: "Search reindex delay", owner: "Emma", severity: "Low", sla: "Resolved" },
        { incident: "Cache miss wave", owner: "Tom", severity: "Low", sla: "Resolved" },
      ],
    },
    summaryByPrimary: {
      Open: "Open alerts are ideal for illustrating a monitoring embed in active read mode.",
      Blocking: "Blocking alerts show how the embed can carry a more critical tone and a fast CTA.",
      Closed: "Closed alerts are useful to show a lighter historical view in a static site.",
    },
  },
};

function normalizeScenario(input: string | undefined): MockScenarioKey {
  switch ((input ?? "").trim()) {
    case "ops-review":
      return "ops-review";
    case "support-center":
      return "support-center";
    default:
      return "sales-cockpit";
  }
}

function buildRuntime(
  scenario: MockScenarioKey,
  state: ScenarioState,
): MiniAppRuntimePayload {
  const spec = SCENARIOS[scenario];
  const rows = spec.rowsByPrimary[state.selectedPrimary] ?? [];

  return {
    contract: "agentmaurice-ui-runtime-v1",
    app_instance_id: `mock-${scenario}`,
    recipe_id: scenario,
    status: "active",
    state: {
      primary: state.selectedPrimary,
      secondary: state.selectedSecondary,
      note: state.note,
    },
    state_version: state.version,
    ui: {
      view: "main",
      tree: {
        type: "section",
        title: spec.title,
        subtitle: spec.subtitle,
        children: [
          {
            type: "card",
            title: spec.primaryLabel,
            children: [
              {
                type: "list",
                source: spec.primaryItems,
                on_item_click: "select_primary",
                item_template: {
                  type: "text",
                  value: "{{ .item }}",
                },
              },
            ],
          },
          {
            type: "card",
            title: spec.secondaryLabel,
            children: [
              {
                type: "list",
                source: spec.secondaryItems,
                on_item_click: "select_secondary",
                item_template: {
                  type: "text",
                  value: "{{ .item }}",
                },
              },
            ],
          },
          {
            type: "card",
            title: "Metrics",
            children: [
              { type: "stat", label: "Active view", value: state.selectedPrimary },
              { type: "stat", label: "Focus", value: state.selectedSecondary },
              { type: "stat", label: "Rows", value: rows.length },
            ],
          },
          {
            type: "callout",
            title: "Demo narrative",
            value: state.note || spec.summaryByPrimary[state.selectedPrimary] || "Mock scenario ready for embedding.",
            tone: "info",
          },
          {
            type: "card",
            title: "Data",
            children: [
              {
                type: "table",
                columns: spec.tableColumns,
                rows,
              },
            ],
          },
          {
            type: "section",
            title: "Actions",
            children: [
              {
                type: "button",
                label: "Simulate refresh",
                on_click: "refresh",
              },
              {
                type: "form_link",
                label: "Annotate the demo",
                form_id: "annotate_demo",
              },
            ],
          },
        ],
      },
      fallback_tree: {
        type: "section",
        title: spec.title,
        children: [
          {
            type: "text",
            value: spec.summaryByPrimary[state.selectedPrimary] || spec.subtitle,
          },
        ],
      },
    },
    forms: FORMS,
    effects: [],
  };
}

class MockEmbedController implements ViewerStateController {
  private listeners = new Set<ViewerStateListener>();
  private data: ScenarioState;
  private state: ViewerState;

  constructor(private readonly scenario: MockScenarioKey) {
    const spec = SCENARIOS[scenario];
    this.data = {
      selectedPrimary: spec.primaryItems[0] ?? "Default",
      selectedSecondary: spec.secondaryItems[0] ?? "Focus",
      note: spec.summaryByPrimary[spec.primaryItems[0] ?? ""] ?? spec.subtitle,
      version: 1,
    };
    this.state = {
      phase: "ready",
      runtime: buildRuntime(this.scenario, this.data),
      error: null,
    };
  }

  getState(): ViewerState {
    return this.state;
  }

  subscribe(listener: ViewerStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async dispatchEvent(
    eventId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    switch (eventId) {
      case "select_primary":
        this.data.selectedPrimary = String(payload.item ?? this.data.selectedPrimary);
        this.data.note =
          SCENARIOS[this.scenario].summaryByPrimary[this.data.selectedPrimary] ??
          this.data.note;
        break;
      case "select_secondary":
        this.data.selectedSecondary = String(payload.item ?? this.data.selectedSecondary);
        break;
      case "refresh":
        this.data.note = `Simulated refresh for ${this.data.selectedPrimary} / ${this.data.selectedSecondary}.`;
        break;
      case "form_submit": {
        const formData =
          payload.data && typeof payload.data === "object"
            ? (payload.data as Record<string, unknown>)
            : {};
        const comment = String(formData.comment ?? "").trim();
        if (comment) {
          this.data.note = comment;
        }
        break;
      }
      default:
        break;
    }

    this.data.version += 1;
    this.state = {
      phase: "ready",
      runtime: buildRuntime(this.scenario, this.data),
      error: null,
    };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export function createMockEmbedController(scenario: string | undefined): ViewerStateController {
  return new MockEmbedController(normalizeScenario(scenario));
}
