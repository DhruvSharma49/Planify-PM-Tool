// ============================================================
// MOCK DATA & STATE
// ============================================================
let nextId = 1000;
const uid = () => `id_${nextId++}`;

const INITIAL_USERS = [
  { id: "u1", name: "Alex Kim", email: "alex@acme.com", avatar: "AK", color: "#6C63FF", role: "admin" },
  { id: "u2", name: "Sara Chen", email: "sara@acme.com", avatar: "SC", color: "#10D9A0", role: "member" },
  { id: "u3", name: "Omar Diaz", email: "omar@acme.com", avatar: "OD", color: "#FFB547", role: "member" },
  { id: "u4", name: "Priya Nair", email: "priya@acme.com", avatar: "PN", color: "#FF5470", role: "member" },
];

const INITIAL_PROJECTS = [
  {
    id: "p1", name: "Product Redesign", description: "Complete overhaul of the main product UI/UX", color: "#6C63FF",
    members: ["u1", "u2", "u3"], createdAt: "2024-01-15", status: "active",
    columns: [
      { id: "c1", name: "Backlog", color: "#4A4E6A" },
      { id: "c2", name: "In Progress", color: "#FFB547" },
      { id: "c3", name: "Review", color: "#6C63FF" },
      { id: "c4", name: "Done", color: "#10D9A0" },
    ],
    tasks: [
      {
        id: "t1", columnId: "c1", title: "User research interviews", description: "Conduct 10 user interviews to gather feedback on current pain points",
        priority: "high", assignees: ["u2"], labels: ["research"], dueDate: "2024-02-15",
        comments: [
          { id: "cm1", userId: "u1", text: "Let's target enterprise users first", createdAt: "2024-01-20T10:00:00Z" },
          { id: "cm2", userId: "u2", text: "Agreed, I'll set up the calendar invites", createdAt: "2024-01-20T11:30:00Z" },
        ],
        attachments: [], createdAt: "2024-01-15T09:00:00Z", order: 0
      },
      {
        id: "t2", columnId: "c2", title: "Design system audit", description: "Audit existing components and identify inconsistencies",
        priority: "medium", assignees: ["u1", "u3"], labels: ["design"], dueDate: "2024-02-10",
        comments: [], attachments: [], createdAt: "2024-01-16T09:00:00Z", order: 0
      },
      {
        id: "t3", columnId: "c2", title: "Wireframe new onboarding flow", description: "Create wireframes for the improved onboarding experience",
        priority: "high", assignees: ["u2"], labels: ["design", "ux"], dueDate: "2024-02-20",
        comments: [
          { id: "cm3", userId: "u3", text: "Can we include a video tutorial option?", createdAt: "2024-01-22T14:00:00Z" }
        ],
        attachments: ["wireframe_v1.fig"], createdAt: "2024-01-17T09:00:00Z", order: 1
      },
      {
        id: "t4", columnId: "c3", title: "Component library v2", description: "Update all base components with new design tokens",
        priority: "high", assignees: ["u1"], labels: ["dev", "design"], dueDate: "2024-02-05",
        comments: [], attachments: [], createdAt: "2024-01-18T09:00:00Z", order: 0
      },
      {
        id: "t5", columnId: "c4", title: "Brand guidelines doc", description: "Finalize and publish updated brand guidelines",
        priority: "low", assignees: ["u3"], labels: ["docs"], dueDate: "2024-01-31",
        comments: [], attachments: [], createdAt: "2024-01-10T09:00:00Z", order: 0
      },
    ]
  },
  {
    id: "p2", name: "API Platform", description: "Build the next-gen API gateway and developer portal", color: "#10D9A0",
    members: ["u1", "u4"], createdAt: "2024-01-20", status: "active",
    columns: [
      { id: "c5", name: "Todo", color: "#4A4E6A" },
      { id: "c6", name: "In Progress", color: "#FFB547" },
      { id: "c7", name: "Testing", color: "#6C63FF" },
      { id: "c8", name: "Deployed", color: "#10D9A0" },
    ],
    tasks: [
      {
        id: "t6", columnId: "c5", title: "OAuth 2.0 implementation", description: "Implement full OAuth 2.0 flow with PKCE support",
        priority: "high", assignees: ["u4"], labels: ["auth", "security"], dueDate: "2024-02-28",
        comments: [], attachments: [], createdAt: "2024-01-20T09:00:00Z", order: 0
      },
      {
        id: "t7", columnId: "c6", title: "Rate limiting middleware", description: "Implement sliding window rate limiting per API key",
        priority: "high", assignees: ["u1", "u4"], labels: ["backend"], dueDate: "2024-02-18",
        comments: [], attachments: [], createdAt: "2024-01-21T09:00:00Z", order: 0
      },
      {
        id: "t8", columnId: "c8", title: "API documentation", description: "Complete OpenAPI spec for all v1 endpoints",
        priority: "medium", assignees: ["u1"], labels: ["docs"], dueDate: "2024-02-01",
        comments: [], attachments: [], createdAt: "2024-01-19T09:00:00Z", order: 0
      },
    ]
  },
  {
    id: "p3", name: "Marketing Site", description: "New company website with improved conversion", color: "#FFB547",
    members: ["u2", "u3", "u4"], createdAt: "2024-01-25", status: "active",
    columns: [
      { id: "c9", name: "Ideas", color: "#4A4E6A" },
      { id: "c10", name: "Writing", color: "#FFB547" },
      { id: "c11", name: "Design", color: "#6C63FF" },
      { id: "c12", name: "Published", color: "#10D9A0" },
    ],
    tasks: [
      {
        id: "t9", columnId: "c9", title: "Landing page copy", description: "Write compelling hero section and feature descriptions",
        priority: "high", assignees: ["u3"], labels: ["content"], dueDate: "2024-02-22",
        comments: [], attachments: [], createdAt: "2024-01-25T09:00:00Z", order: 0
      },
      {
        id: "t10", columnId: "c11", title: "Hero illustration", description: "Create custom illustration for the hero section",
        priority: "medium", assignees: ["u2"], labels: ["design"], dueDate: "2024-02-25",
        comments: [], attachments: [], createdAt: "2024-01-26T09:00:00Z", order: 0
      },
    ]
  }
];

const ACTIVITY_LOG = [
  { id: "a1", userId: "u2", action: "moved", target: "Wireframe new onboarding flow", targetType: "task", to: "In Progress", projectId: "p1", time: "2 hours ago" },
  { id: "a2", userId: "u1", action: "commented on", target: "User research interviews", targetType: "task", projectId: "p1", time: "3 hours ago" },
  { id: "a3", userId: "u4", action: "created", target: "OAuth 2.0 implementation", targetType: "task", projectId: "p2", time: "5 hours ago" },
  { id: "a4", userId: "u3", action: "completed", target: "Brand guidelines doc", targetType: "task", projectId: "p1", time: "1 day ago" },
  { id: "a5", userId: "u1", action: "created project", target: "API Platform", targetType: "project", projectId: "p2", time: "2 days ago" },
];
