export type ScormState = {
    [key: string]: string
}

export type ScormAPIResponse = {
    errorMessage: string | undefined,
    state?: ScormState
}