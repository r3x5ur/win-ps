export interface ProcessItem {
    pid: number
    ppid: number
    name: string
}

export function ps(): ProcessItem[]
