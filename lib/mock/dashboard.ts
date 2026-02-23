import { faker } from "@faker-js/faker";
import type { DashboardCoreData } from "@/lib/queries/dashboard";

const PROJECT_STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;
const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"] as const;
const CLIENT_STATUSES = ["active", "inactive", "lead"] as const;
const TASK_STATUSES = ["todo", "in_progress", "review", "done"] as const;

/**
 * Seed faker for reproducible mock data (optional).
 * Call with a number, e.g. seed(42), for consistent data across runs.
 */
export function seed(value?: number) {
  if (value !== undefined) {
    faker.seed(value);
  }
}

function mockClient(userId: string) {
  const name = faker.person.fullName();
  return {
    id: faker.string.uuid(),
    user_id: userId,
    name,
    company: faker.company.name(),
    email: faker.internet.email({ firstName: name.split(" ")[0] }),
    status: faker.helpers.arrayElement(CLIENT_STATUSES),
    total_billed: faker.number.float({ min: 500, max: 50000, fractionDigits: 2 }),
    last_contact: faker.date.recent({ days: 60 }).toISOString(),
    created_at: faker.date.recent({ days: 45 }).toISOString(),
    updated_at: faker.date.recent({ days: 45 }).toISOString(),
  };
}

function mockProject(clientId: string) {
  const dueDate = faker.date.soon({ days: 90 });
  return {
    id: faker.string.uuid(),
    title: faker.helpers.arrayElement([
      "Website redesign",
      "Brand identity",
      "Mobile app",
      "API integration",
      "Marketing site",
      "E-commerce platform",
    ]),
    status: faker.helpers.arrayElement(PROJECT_STATUSES),
    progress: faker.number.int({ min: 0, max: 100 }),
    value: faker.number.float({ min: 2000, max: 25000, fractionDigits: 2 }),
    due_date: dueDate.toISOString().split("T")[0],
    client_id: clientId,
    created_at: faker.date.recent({ days: 45 }).toISOString(),
    updated_at: faker.date.recent({ days: 45 }).toISOString(),
  };
}

function mockInvoice(userId: string, projectId: string, clientId: string) {
  const issueDate = faker.date.recent({ days: 45 });
  const dueDate = faker.date.soon({ days: 30 });
  const status = faker.helpers.arrayElement(INVOICE_STATUSES);
  return {
    id: faker.string.uuid(),
    user_id: userId,
    project_id: projectId,
    client_id: clientId,
    number: `INV-${faker.string.numeric(6)}`,
    amount: faker.number.float({ min: 500, max: 15000, fractionDigits: 2 }),
    status,
    due_date: dueDate.toISOString().split("T")[0],
    issue_date: issueDate.toISOString().split("T")[0],
    paid_date: status === "paid" ? faker.date.recent({ days: 14 }).toISOString().split("T")[0] : null,
    pdf_url: faker.image.url({ width: 400, height: 300 }),
    created_at: faker.date.recent({ days: 45 }).toISOString(),
    updated_at: faker.date.recent({ days: 45 }).toISOString(),
  };
}

function mockTask(projectId: string, userId: string) {
  const dueDate = faker.date.soon({ days: 21 });
  const completed = faker.datatype.boolean({ probability: 0.3 });
  return {
    id: faker.string.uuid(),
    project_id: projectId,
    title: faker.helpers.arrayElement([
      "Design review",
      "Copy updates",
      "API documentation",
      "Testing",
      "Deployment",
      "Client feedback",
    ]),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(TASK_STATUSES),
    due_date: dueDate.toISOString().split("T")[0],
    completed_date: completed ? faker.date.recent({ days: 7 }).toISOString().split("T")[0] : null,
    is_overdue: !completed && dueDate < new Date(),
    projects: [{ user_id: userId, id: projectId }],
    created_at: faker.date.recent({ days: 45 }).toISOString(),
    updated_at: faker.date.recent({ days: 45 }).toISOString(),
  };
}

function mockPortfolioItem() {
  const title = faker.helpers.arrayElement([
    "E-commerce platform",
    "SaaS dashboard",
    "Portfolio site",
    "Mobile app",
    "Brand campaign",
  ]);
  return {
    id: faker.string.uuid(),
    title,
    slug: faker.helpers.slugify(title).toLowerCase(),
    description: faker.lorem.paragraph(),
    thumbnail_url: faker.image.url({ width: 400, height: 300 }),
    live_url: faker.internet.url(),
    view_count: faker.number.int({ min: 0, max: 5000 }),
    created_at: faker.date.recent({ days: 45 }).toISOString(),
    updated_at: faker.date.recent({ days: 45 }).toISOString(),
  };
}

/**
 * Generates mock dashboard data matching the shape returned by getDashboardCoreData.
 * Uses optional seed for reproducible data (e.g. seed(42) before calling).
 */
export function getMockDashboardCoreData(userId: string): DashboardCoreData {
  seed(42);

  const clientCount = faker.number.int({ min: 3, max: 8 });
  const clients = Array.from({ length: clientCount }, () => mockClient(userId));

  const projectCount = faker.number.int({ min: 4, max: 12 });
  const projects = Array.from({ length: projectCount }, () => {
    const client = faker.helpers.arrayElement(clients);
    return mockProject(client.id);
  });

  const invoices = Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => {
    const project = faker.helpers.arrayElement(projects);
    const client = clients.find((c) => c.id === project.client_id)!;
    return mockInvoice(userId, project.id, client.id);
  });

  const tasks = projects.flatMap((p) =>
    Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
      const t = mockTask(p.id, userId);
      return t;
    })
  );

  const portfolio = Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () =>
    mockPortfolioItem()
  );

  return {
    projects,
    invoices,
    clients,
    tasks,
    portfolio,
  };
}
