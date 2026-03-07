import { useState } from "react"

export function useEntityDialog<T>() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editEntity, setEditEntity] = useState<T | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    return {
        isAddOpen,
        openAdd: () => setIsAddOpen(true),
        closeAdd: () => setIsAddOpen(false),

        editEntity,
        openEdit: (entity: T) => setEditEntity(entity),
        closeEdit: () => setEditEntity(null),

        deleteId,
        openDelete: (id: string) => setDeleteId(id),
        closeDelete: () => setDeleteId(null),

        closeAll: () => {
            setIsAddOpen(false);
            setEditEntity(null);
            setDeleteId(null);
        },
    };
}