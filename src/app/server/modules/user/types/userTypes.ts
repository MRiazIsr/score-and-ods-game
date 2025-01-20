export type DbUser = {
    name: string
    email: string
    PartitionKey: string
    SortKey: string
    password: string
    userName: string
}

export type User = {
    name?: string
    email?: string
    password: string
    userName: string
}