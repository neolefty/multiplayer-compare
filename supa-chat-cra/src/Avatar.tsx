import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

export default function Avatar({
    url,
    size,
    onUpload,
}: {
    url?: string
    size: number
    onUpload: (filePath: string) => void
}) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [error, setError] = useState<string>()
    const [uploading, setUploading] = useState(false)

    const isStoredImage = url && url.indexOf("/") >= 0

    const handleError = useCallback((context: string, error: unknown) => {
        if (error) {
            setError(`Error ${context}: ${error}`)
            console.error({ context, error })
        } else {
            setError(undefined)
        }
    }, [])

    const downloadImage = useCallback(
        async (path: string) => {
            try {
                const { data, error } = await supabase.storage.from("avatars").download(path)
                handleError("loading image", error)
                if (data) {
                    const url = URL.createObjectURL(data)
                    setAvatarUrl(url)
                }
            } catch (error) {
                handleError("loading image", error)
            }
        },
        [handleError]
    )

    useEffect(() => {
        if (url) downloadImage(url)
    }, [downloadImage, url])

    const handleUpload = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            setUploading(true)
            try {
                const files = event.target.files
                if (!files?.length) setError("Please select an image to upload.")
                else {
                    const file = files[0]
                    const fileExt = file.name.split(".").pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `${fileName}`
                    const { error } = await supabase.storage.from("avatars").upload(filePath, file)
                    handleError("uploading image", error)
                    if (!error) onUpload(filePath)
                }
            } catch (error) {
                handleError("uploading image", error)
            } finally {
                setUploading(false)
            }
        },
        [handleError, onUpload]
    )

    return (
        <>
            <div aria-live="polite">
                {isStoredImage && <img src={url} alt="avatar" title="avatar" />}
                {!isStoredImage && (
                    <img
                        src={avatarUrl ? avatarUrl : `https://place-hold.it/${size}x${size}`}
                        alt={avatarUrl ? "Avatar" : "No Image"}
                        title={avatarUrl ? "Avatar" : "No Image"}
                        style={{ height: size, width: size }}
                    />
                )}
                <label htmlFor="single">Upload your own image</label>
                <input type="file" id="single" accept="image/*" onChange={handleUpload} disabled={uploading} />
            </div>
            {uploading && <p>Uploading ...</p>}
            {error && <p>{error}</p>}
        </>
    )
}
