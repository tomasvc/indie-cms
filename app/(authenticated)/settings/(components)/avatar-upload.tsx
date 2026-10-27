"use client";

import { useRef, useState } from "react";
import { UploadIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Uploads a photo to the user's folder in the `avatars` bucket and hands back its public URL.
 * The URL is saved with the rest of the profile form.
 */
export function AvatarUpload({ value, name, onChange }: { value: string; name: string; onChange: (url: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function upload(file: File) {
        setError(null);
        if (!ACCEPTED.includes(file.type)) return setError("Use a PNG, JPG, WebP or GIF image.");
        if (file.size > MAX_BYTES) return setError("Keep the image under 2 MB.");

        setIsUploading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not signed in");
            const extension = file.name.split(".").pop()?.toLowerCase() || "png";
            const path = `${user.id}/${Date.now()}.${extension}`;
            const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            onChange(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
        } catch {
            setError("Couldn't upload that image. Please try again.");
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <Avatar className="size-14 rounded-full">
                    {value && <AvatarImage src={value} alt="" />}
                    <AvatarFallback className="rounded-full">{name.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
                        <UploadIcon aria-hidden />
                        {isUploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
                    </Button>
                    {value && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} disabled={isUploading}>
                            <XIcon aria-hidden />
                            Remove
                        </Button>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="sr-only"
                    aria-label="Profile photo"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void upload(file);
                    }}
                />
            </div>
            <p className="text-[13px] text-muted-foreground">PNG, JPG, WebP or GIF, up to 2 MB. Save the form to keep it.</p>
            {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}
        </div>
    );
}
