import { Project, Task } from "@/types";

export function getActiveProjects(
    projects: Array<Project> | null
): Array<Project | (Project & { id: "others"; count: number })> {
    if (!projects) return [];

    const filtered = projects.filter(
        (project) => project.status === "active" || project.status === "review"
    );

    if (filtered.length <= 3) {
        return filtered;
    }

    const firstThree = filtered.slice(0, 3);

    const others = filtered.slice(3);

    const totalOtherValue = others.reduce(
        (sum, proj) => sum + (proj.value || 0),
        0
    );
    const avgProgress =
        others.length > 0
            ? Math.round(
                others.reduce((sum, proj) => sum + (proj.progress || 0), 0) /
                others.length
            )
            : 0;

    const othersProject: Project & { id: "others"; count: number } = {
        ...others[0],
        id: "others",
        title: "Other",
        description: "",
        status: "active",
        client_id: "",
        value: totalOtherValue,
        due_date: "",
        progress: avgProgress,
        created_at: "",
        updated_at: "",
        count: others.length,
    };

    return [...firstThree, othersProject];
}

export function getOverdueTasks(tasks: Array<Task> | null): Array<Task> {
    return tasks?.filter((task) => task.is_overdue) ?? [];
}

export function getUpcomingDeadlines(tasks: Array<Task> | null): Array<Task> {
    return (
        tasks?.filter(
            (task) => task.due_date && new Date(task.due_date) < new Date()
        ) ?? []
    );
}