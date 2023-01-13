import { useCallback, useRef, useState } from "react"

export default function useDeepState<S>(initialState: S): [s: S, setter: (s: S) => boolean] {
    const [state, setState] = useState(initialState)
    const jsonRef = useRef<string>()
    const setDeepState = useCallback((newState: S) => {
        const newJson = JSON.stringify(newState)
        if (newJson !== jsonRef.current) {
            // console.log({ newJson, oldJson: jsonRef.current })
            jsonRef.current = newJson
            setState(newState)
            return true
        } else return false
    }, [])
    return [state, setDeepState]
}
