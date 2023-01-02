import { JsonValue } from "type-fest"

export default function Tree({ json }: { json: JsonValue | undefined }) {
    if (Array.isArray(json))
        return (
            <ul>
                {json.map((item, i) => (
                    <li key={i}>
                        <Tree json={item} />
                    </li>
                ))}
            </ul>
        )
    else if (json !== null && typeof json === "object")
        return (
            <ul>
                {Object.entries(json).map(([key, value]) => (
                    <li key={key}>
                        {key}: <Tree json={value} />
                    </li>
                ))}
            </ul>
        )
    // number, string, boolean, undefined, null
    else return <>{JSON.stringify(json)}</>
}
