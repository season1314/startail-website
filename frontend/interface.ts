export interface ArticleItem {
    title: string
    id: string
    cover: string
    tags: any[]
    createdAt: string
    createdInfo: { name: string, email: string }
    summary: string,
    files:{des:string,path:string}[]
}