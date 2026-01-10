export interface MailProps {
    email: string,
    from: string,
    subject: string,
    html: string
}

export interface ResponseProps {
    code: number,
    data?: any[],
    messages?: string
}

export interface ArticleProps {
    title: string
    id: string
    cover: string
    tags: any[]
    createdAt: string
    createdInfo: { name: string, email: string }
    summary: string,
    files: { des: string, path: string }[]
}
