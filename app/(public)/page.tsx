import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Activity,
  CalendarDays,
  CircleDot,
  Clock3,
  Download,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

const stats = [
  {
    label: "Open Positions",
    value: "4",
    helper: "of 8 total",
    icon: BriefcaseBusiness,
  },
  {
    label: "Total Candidates",
    value: "41",
    helper: "Across all jobs",
    icon: Users,
  },
  {
    label: "Avg. Time Open",
    value: "48d",
    helper: "Target: 45 days",
    icon: Clock3,
  },
  {
    label: "Hired",
    value: "7",
    helper: "This quarter",
    icon: CircleDot,
  },
];

const jobs = [
  {
    title: "Backend Developer",
    department: "Engineering",
    location: "Remote",
    status: "Draft",
    candidates: 3,
    posted: "Feb 2",
    priority: "Priority",
  },
  {
    title: "Senior Frontend Engineer",
    department: "DevOps",
    location: "Remote",
    status: "Draft",
    candidates: 9,
    posted: "Feb 1",
    priority: "Urgent",
  },
  {
    title: "Product Designer",
    department: "Product",
    location: "Remote",
    status: "Active",
    candidates: 3,
    posted: "Jan 3",
    priority: null,
  },
  {
    title: "Data Scientist",
    department: "Data",
    location: "Remote",
    status: "Closed",
    candidates: 4,
    posted: "Dec 8",
    priority: "Urgent",
  },
  {
    title: "QA Engineer",
    department: "QA",
    location: "Remote",
    status: "Active",
    candidates: 5,
    posted: "Jan 28",
    priority: "Urgent",
  },
  {
    title: "Engineering Manager",
    department: "Data",
    location: "Hybrid",
    status: "Active",
    candidates: 4,
    posted: "Dec 18",
    priority: "Priority",
  },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Jobs", icon: BriefcaseBusiness, active: true },
  { label: "Candidates", icon: Users, active: false },
  { label: "Analytics", icon: Activity, active: false },
  { label: "Calendar", icon: CalendarDays, active: false },
];

function statusVariant(status: string): "secondary" | "outline" {
  return status === "Active" ? "secondary" : "outline";
}

export default function Page() {
  return (
    <main className="bg-muted/40 min-h-screen">
      <div className="mx-auto flex">
        <aside className="bg-background sticky top-0 hidden h-screen w-64 shrink-0 border-r px-4 py-5 lg:block">
          <div className="mb-6 flex items-center gap-2 px-2">
            <div className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md">
              <BriefcaseBusiness className="size-3.5" />
            </div>
            <p className="text-sm font-semibold tracking-tight">Indie CMS</p>
          </div>

          <Button className="mb-6 w-full justify-start" size="sm">
            <Plus className="size-3.5" />
            New Job
          </Button>

          <p className="text-muted-foreground mb-2 px-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
            Main
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${item.active
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                type="button"
              >
                <item.icon className="size-3.5" />
                {item.label}
              </button>
            ))}
          </nav>

          <p className="text-muted-foreground mt-7 mb-2 px-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
            AI Tools
          </p>
          <button
            className="hover:bg-muted flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs"
            type="button"
          >
            <span className="text-muted-foreground inline-flex items-center gap-2">
              <Sparkles className="size-3.5" />
              JD Writer
            </span>
            <Badge className="px-1.5" variant="secondary">
              AI
            </Badge>
          </button>

          <div className="mt-auto space-y-1 pt-8">
            <button
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs"
              type="button"
            >
              <Settings className="size-3.5" />
              Settings
            </button>
            <button
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs"
              type="button"
            >
              <HelpCircle className="size-3.5" />
              Help & Support
            </button>
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs">HireFlow</p>
              <h1 className="text-lg font-semibold tracking-tight">Jobs</h1>
            </div>
            <Button variant="outline">
              <Download className="size-3.5" />
              Export
            </Button>
          </header>

          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} size="sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-[11px] font-semibold tracking-[0.1em] uppercase">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-semibold leading-none">{stat.value}</p>
                    <p className="text-muted-foreground mt-1 text-[11px]">{stat.helper}</p>
                  </div>
                  <div className="bg-muted text-muted-foreground grid size-7 place-items-center rounded-md">
                    <stat.icon className="size-3.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Jobs</CardTitle>
                  <p className="text-muted-foreground text-[11px]">
                    8 jobs • 4 active • 41 total candidates
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="text-muted-foreground absolute top-1/2 left-2 size-3 -translate-y-1/2" />
                    <Input className="pl-7" placeholder="Search jobs..." />
                  </div>
                  <Button size="sm">
                    <Plus className="size-3.5" />
                    Add Job
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b text-[10px] tracking-[0.1em] uppercase">
                      <th className="px-4 py-2.5 font-medium">Position</th>
                      <th className="px-4 py-2.5 font-medium">Department</th>
                      <th className="px-4 py-2.5 font-medium">Location</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Candidates</th>
                      <th className="px-4 py-2.5 font-medium">Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.title} className="hover:bg-muted/40 border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-muted text-muted-foreground grid size-6 place-items-center rounded-md">
                              <Gauge className="size-3" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{job.title}</p>
                              {job.priority ? (
                                <Badge className="mt-1 px-1.5" variant="outline">
                                  {job.priority}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">{job.department}</td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">{job.location}</td>
                        <td className="px-4 py-3">
                          <Badge className="px-1.5" variant={statusVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">{job.candidates}</td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">{job.posted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
